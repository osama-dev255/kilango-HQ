import { getTemplateConfig, generateCustomReceipt, getPurchaseTemplateConfig, generateCustomPurchaseReceipt } from "@/utils/templateUtils";

// Remove the dynamic import approach and use a CDN-based solution instead
// This avoids build-time dependency resolution issues with Vite/Rollup

// Utility functions for printing
export class PrintUtils {
  // Check if we're on a mobile device
  static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Generate QR code for receipt using a CDN-based approach
  static async generateReceiptQRCode(transaction: any, type: 'sales' | 'purchase'): Promise<string> {
    try {
      // Create a URL that points to a page that displays the receipt details
      const receiptData = {
        type,
        receiptNumber: type === 'sales' ? transaction.receiptNumber : transaction.orderNumber,
        date: new Date().toISOString(),
        items: transaction.items || [],
        subtotal: transaction.subtotal || 0,
        tax: transaction.tax || 0,
        discount: transaction.discount || 0,
        total: transaction.total || 0,
        amountReceived: transaction.amountReceived || 0,
        change: transaction.change || 0,
      };
      
      const receiptDataString = JSON.stringify(receiptData);
      console.log('QR Code Generation - Receipt Data:', receiptDataString);
      
      // Use a CDN-based QR code generator to avoid build issues
      // This creates a data URL without requiring the qrcode library at build time
      const encodedData = encodeURIComponent(receiptDataString);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedData}&size=120x120&ecc=M`;
      
      // For better reliability, we'll return the URL and let the browser fetch it
      // This avoids any build-time dependency issues
      return qrUrl;
    } catch (error) {
      console.error('Error generating QR code in generateReceiptQRCode:', error);
      return '';
    }
  }

  // Print receipt with enhanced formatting and mobile support
  static async printReceipt(transaction: any) {
    // Check if Bluetooth printing is enabled
    const enableBluetoothPrinting = localStorage.getItem('enableBluetoothPrinting') === 'true';
    const autoPrintReceipts = localStorage.getItem('autoPrintReceipts') !== 'false'; // default to true
    
    if (enableBluetoothPrinting && autoPrintReceipts) {
      try {
        // Try to print via Bluetooth printer
        const { BluetoothPrinter } = await import('@/utils/bluetoothPrinter');
        
        if (BluetoothPrinter.isConnected()) {
          // Get business info from localStorage
          const businessInfo = {
            name: localStorage.getItem('businessName') || 'POS BUSINESS',
            address: localStorage.getItem('businessAddress') || '123 Business St, City, Country',
            phone: localStorage.getItem('businessPhone') || 'Phone: (123) 456-7890'
          };
          
          const success = await BluetoothPrinter.printReceipt(transaction, businessInfo);
          if (success) {
            console.log('Receipt printed successfully via Bluetooth printer');
            return;
          } else {
            console.error('Failed to print receipt via Bluetooth printer');
          }
        }
      } catch (error) {
        console.error('Error with Bluetooth printing:', error);
        // Fall back to browser printing if Bluetooth fails
      }
    }
    
    // Show loading indicator
    this.showLoadingIndicator('Preparing print...');
    
    // Generate QR code URL for the receipt
    let qrCodeUrl = '';
    let qrGenerationError = '';
    try {
      const receiptData = {
        type: 'sales',
        receiptNumber: transaction.receiptNumber || Date.now(),
        date: new Date().toISOString(),
        items: transaction.items,
        subtotal: transaction.subtotal,
        tax: transaction.tax,
        discount: transaction.discount,
        total: transaction.total,
        amountReceived: transaction.amountReceived,
        change: transaction.change
      };
      
      const qrCodeData = JSON.stringify(receiptData);
      console.log('Print Receipt - Generating QR code with data length:', qrCodeData.length);
      console.log('Print Receipt - QR Code Data:', qrCodeData);
      
      // Use CDN-based QR code generation
      const encodedData = encodeURIComponent(qrCodeData);
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedData}&size=120x120&ecc=M`;
      
      console.log('Print Receipt - QR Code URL generated successfully:', qrCodeUrl);
    } catch (error) {
      console.error('Print Receipt - Error generating QR code:', error);
      qrGenerationError = error.message;
      qrCodeUrl = '';
    }
    
    console.log('Print Receipt - Final QR Code URL:', qrCodeUrl ? 'Present' : 'Empty');
    console.log('Print Receipt - QR Generation Error:', qrGenerationError);
    
    // For mobile devices, use the mobile print approach
    if (this.isMobileDevice()) {
      return this.printReceiptMobile(transaction, qrCodeUrl);
    }

    // For desktop, use a hidden iframe approach to avoid window stacking
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-1000px';
    printFrame.style.left = '-1000px';
    document.body.appendChild(printFrame);
    
    const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (!printDocument) {
      this.hideLoadingIndicator();
      console.error('Could not access print frame document');
      return;
    }
    
    // Get template configuration
    const templateConfig = getTemplateConfig();
    
    let receiptContent;
    
    // Use custom template if enabled
    if (templateConfig.customTemplate) {
      receiptContent = generateCustomReceipt(transaction, templateConfig);
    } else {
      // Format items for receipt
      const formattedItems = transaction.items.map((item: any) => {
        const total = item.price * item.quantity;
        return {
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: total
        };
      });
      
      // Calculate totals
      const subtotal = transaction.subtotal || formattedItems.reduce((sum: number, item: any) => sum + item.total, 0);
      const tax = transaction.tax || 0;
      const discount = transaction.discount || 0;
      const total = transaction.total || (subtotal + tax - discount);
      const amountReceived = transaction.amountReceived || total;
      const change = transaction.change || (amountReceived - total);
      
      receiptContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Receipt</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @media print {
        @page {
          margin: 0.5in;
          size: auto;
        }
        body {
          margin: 0.5in;
          padding: 0;
        }
      }
      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        max-width: 320px;
        margin: 0 auto;
        padding: 10px;
      }
      .header {
        text-align: center;
        border-bottom: 1px dashed #000;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      .business-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .business-info {
        font-size: 10px;
        margin-bottom: 5px;
      }
      .receipt-info {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        margin-bottom: 10px;
      }
      .items {
        margin-bottom: 10px;
      }
      .item {
        display: flex;
        margin-bottom: 5px;
      }
      .item-name {
        flex: 2;
      }
      .item-details {
        flex: 1;
        text-align: right;
      }
      .item-price::before {
        content: "@ ";
      }
      .item-total {
        font-weight: bold;
      }
      .totals {
        border-top: 1px dashed #000;
        padding-top: 10px;
        margin-top: 10px;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .final-total {
        font-weight: bold;
        font-size: 14px;
        margin: 10px 0;
      }
      .payment-info {
        border-top: 1px dashed #000;
        padding-top: 10px;
        margin-top: 10px;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 10px;
      }
      .thank-you {
        font-weight: bold;
        margin-bottom: 10px;
      }
      /* QR Code Styles */
      .qr-section {
        text-align: center;
        margin: 15px 0;
        padding: 10px;
        border-top: 1px dashed #000;
      }
      .qr-label {
        font-size: 9px;
        margin-bottom: 5px;
      }
      .qr-code-img {
        max-width: 120px;
        height: auto;
        margin: 10px auto;
        display: block;
      }
      .qr-error {
        font-size: 8px;
        color: #666;
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="business-name">POS BUSINESS</div>
      <div class="business-info">123 Business St, City, Country</div>
      <div class="business-info">Phone: (123) 456-7890</div>
    </div>
    
    <div class="receipt-info">
      <div>Receipt #: ${transaction.receiptNumber || Date.now()}</div>
      <div>Date: ${new Date().toLocaleDateString()}</div>
      <div>Time: ${new Date().toLocaleTimeString()}</div>
    </div>
    
    <div class="items">
      ${formattedItems.map((item: any) => `
        <div class="item">
          <div class="item-name">${item.name}</div>
          <div class="item-details">${item.quantity} x @ ${item.price.toFixed(2)}</div>
          <div class="item-total">${item.total.toFixed(2)}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="totals">
      <div class="total-row">
        <div>Subtotal:</div>
        <div>${subtotal.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Tax:</div>
        <div>${tax.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Discount:</div>
        <div>${discount.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Total:</div>
        <div>${total.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="payment-info">
      <div>Amount Received:</div>
      <div>${amountReceived.toFixed(2)}</div>
      <div>Change:</div>
      <div>${change.toFixed(2)}</div>
    </div>
    
    <div class="footer">
      <div class="thank-you">Thank You!</div>
      <div>For more info, visit us at www.posbusiness.com</div>
    </div>
    
    <div class="qr-section">
      <div class="qr-label">Scan for Details</div>
      ${qrCodeUrl ? 
        `<div style="margin: 10px 0; text-align: center;">
           <img src="${qrCodeUrl}" width="120" height="120" class="qr-code-img" alt="Receipt QR Code" 
                style="max-width: 120px; height: auto; width: 120px; height: 120px; margin: 10px auto; display: block; border: 1px solid #ccc; background: #f9f9f9;"
                onerror="console.error('QR Code failed to load - URL:', this.src); 
                        this.style.display='none'; 
                        var errorDiv = this.parentNode.querySelector('.qr-error'); 
                        if (errorDiv) errorDiv.style.display='block';
                        console.log('QR Code onerror triggered - src:', this.src);" 
                onload="console.log('QR Code loaded successfully - src:', this.src);" />
           <div class="qr-error" style="font-size: 8px; color: #666; margin: 5px 0; display: none;">QR Code failed to load</div>
         </div>` : 
        `<div style="margin: 10px 0; text-align: center;">
           <div style="font-size: 8px; color: #666;">
             ${qrGenerationError ? 
               `QR Code generation failed: ${qrGenerationError.substring(0, 50)}...` : 
               'QR Code not available'}
           </div>
         </div>`}
      <div style="font-size: 8px; margin-top: 5px;">Receipt #: ${transaction.receiptNumber || Date.now()}</div>
    </div>
  </body>
</html>`;
    }
    
    // Write content to iframe and print
    printDocument.open();
    printDocument.write(receiptContent);
    printDocument.close();
    
    // Wait for content to load before printing
    printFrame.onload = () => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (error) {
        console.error('Error during printing:', error);
      } finally {
        // Clean up - remove iframe after a short delay to ensure printing started
        setTimeout(() => {
          if (printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }
          this.hideLoadingIndicator();
        }, 1000);
      }
    };
    
    // Fallback cleanup in case onload doesn't fire
    setTimeout(() => {
      if (printFrame.parentNode) {
        printFrame.parentNode.removeChild(printFrame);
      }
      this.hideLoadingIndicator();
    }, 5000);
  }

  // Print purchase receipt for a single transaction
  static async printPurchaseReceipt(transaction: any) {
    // Check if Bluetooth printing is enabled
    const enableBluetoothPrinting = localStorage.getItem('enableBluetoothPrinting') === 'true';
    const autoPrintReceipts = localStorage.getItem('autoPrintReceipts') !== 'false'; // default to true
    
    if (enableBluetoothPrinting && autoPrintReceipts) {
      try {
        // Try to print via Bluetooth printer
        const { BluetoothPrinter } = await import('@/utils/bluetoothPrinter');
        
        if (BluetoothPrinter.isConnected()) {
          // Get business info from localStorage
          const businessInfo = {
            name: localStorage.getItem('businessName') || 'POS BUSINESS',
            address: localStorage.getItem('businessAddress') || '123 Business St, City, Country',
            phone: localStorage.getItem('businessPhone') || 'Phone: (123) 456-7890'
          };
          
          const success = await BluetoothPrinter.printPurchaseReceipt(transaction, businessInfo);
          if (success) {
            console.log('Purchase receipt printed successfully via Bluetooth printer');
            return;
          } else {
            console.error('Failed to print purchase receipt via Bluetooth printer');
          }
        }
      } catch (error) {
        console.error('Error with Bluetooth printing:', error);
        // Fall back to browser printing if Bluetooth fails
      }
    }
    
    // Show loading indicator
    this.showLoadingIndicator('Preparing print...');
    
    // Generate QR code URL for the receipt
    let qrCodeUrl = '';
    let qrGenerationError = '';
    try {
      const receiptData = {
        type: 'purchase',
        orderNumber: transaction.orderNumber || 'PO-' + Date.now(),
        date: new Date().toISOString(),
        items: transaction.items,
        supplier: transaction.supplier,
        subtotal: transaction.subtotal,
        discount: transaction.discount,
        total: transaction.total,
        paymentMethod: transaction.paymentMethod,
        amountReceived: transaction.amountReceived,
        change: transaction.change
      };
      
      const qrCodeData = JSON.stringify(receiptData);
      console.log('Print Purchase Receipt - Generating QR code with data length:', qrCodeData.length);
      console.log('Print Purchase Receipt - QR Code Data:', qrCodeData);
      
      // Use CDN-based QR code generation
      const encodedData = encodeURIComponent(qrCodeData);
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedData}&size=120x120&ecc=M`;
      
      console.log('Print Purchase Receipt - QR Code URL generated successfully:', qrCodeUrl);
    } catch (error) {
      console.error('Print Purchase Receipt - Error generating QR code:', error);
      qrGenerationError = error.message;
      qrCodeUrl = '';
    }
    
    console.log('Print Purchase Receipt - Final QR Code URL:', qrCodeUrl ? 'Present' : 'Empty');
    console.log('Print Purchase Receipt - QR Generation Error:', qrGenerationError);
    
    // For mobile devices, use the mobile print approach
    if (this.isMobileDevice()) {
      return this.printPurchaseReceiptMobile(transaction, qrCodeUrl);
    }

    // For desktop, use a hidden iframe approach to avoid window stacking
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-1000px';
    printFrame.style.left = '-1000px';
    document.body.appendChild(printFrame);
    
    const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (!printDocument) {
      this.hideLoadingIndicator();
      console.error('Could not access print frame document');
      return;
    }
    
    // Get purchase template configuration
    const templateConfig = getPurchaseTemplateConfig();
    
    let receiptContent;
    
    // Use custom template if enabled
    if (templateConfig.customTemplate) {
      receiptContent = generateCustomPurchaseReceipt(transaction, templateConfig);
    } else {
      // Format items for receipt
      const formattedItems = transaction.items || [];
      
      // Calculate totals
      const subtotal = transaction.subtotal || formattedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      // Display only tax (18% of subtotal) - for informational purposes only
      const displayTax = subtotal * 0.18;
      const discount = transaction.discount || 0;
      // Actual total calculation (tax not included in computation)
      const total = transaction.total || (subtotal - discount);
      const amountReceived = transaction.amountReceived || total;
      const change = transaction.change || (amountReceived - total);
      
      receiptContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Purchase Receipt</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @media print {
                @page {
                  margin: 0.5in;
                  size: auto;
                }
                body {
                  margin: 0.5in;
                  padding: 0;
                }
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                max-width: 320px;
                margin: 0 auto;
                padding: 10px;
              }
              .header {
                text-align: center;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
                margin-bottom: 10px;
              }
              .business-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .business-info {
                font-size: 10px;
                margin-bottom: 5px;
              }
              .receipt-info {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                margin-bottom: 10px;
              }
              .items {
                margin-bottom: 10px;
              }
              .item {
                display: flex;
                margin-bottom: 5px;
              }
              .item-name {
                flex: 2;
              }
              .item-details {
                flex: 1;
                text-align: right;
              }
              .item-price::before {
                content: "@ ";
              }
              .item-total {
                font-weight: bold;
              }
              .totals {
                border-top: 1px dashed #000;
                padding-top: 10px;
                margin-top: 10px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              .final-total {
                font-weight: bold;
                font-size: 14px;
                margin: 10px 0;
              }
              .payment-info {
                border-top: 1px dashed #000;
                padding-top: 10px;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 10px;
              }
              .thank-you {
                font-weight: bold;
                margin-bottom: 10px;
              }
              /* QR Code Styles */
              .qr-section {
                text-align: center;
                margin: 15px 0;
                padding: 10px;
                border-top: 1px dashed #000;
              }
              .qr-label {
                font-size: 9px;
                margin-bottom: 5px;
              }
              .qr-code-img {
                max-width: 120px;
                height: auto;
                margin: 10px auto;
                display: block;
              }
              .qr-error {
                font-size: 8px;
                color: #666;
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="business-name">POS BUSINESS</div>
              <div class="business-info">123 Business St, City, Country</div>
              <div class="business-info">Phone: (123) 456-7890</div>
            </div>
            
            <div class="receipt-info">
              <div>Order #: ${transaction.orderNumber || 'PO-' + Date.now()}</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
              <div>Time: ${new Date().toLocaleTimeString()}</div>
            </div>
            
            <div class="items">
              ${formattedItems.map((item: any) => `
                <div class="item">
                  <div class="item-name">${item.name}</div>
                  <div class="item-details">${item.quantity} x @ ${item.price.toFixed(2)}</div>
                  <div class="item-total">${item.total.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="totals">
              <div class="total-row">
                <div>Subtotal:</div>
                <div>${subtotal.toFixed(2)}</div>
              </div>
              <div class="total-row">
                <div>Tax (18%):</div>
                <div>${displayTax.toFixed(2)}</div>
              </div>
              <div class="total-row">
                <div>Discount:</div>
                <div>${discount.toFixed(2)}</div>
              </div>
              <div class="total-row">
                <div>Total:</div>
                <div>${total.toFixed(2)}</div>
              </div>
            </div>
            
            <div class="payment-info">
              <div>Payment Method:</div>
              <div>${transaction.paymentMethod}</div>
              <div>Amount Received:</div>
              <div>${amountReceived.toFixed(2)}</div>
              <div>Change:</div>
              <div>${change.toFixed(2)}</div>
            </div>
            
            <div class="footer">
              <div class="thank-you">Thank You!</div>
              <div>For more info, visit us at www.posbusiness.com</div>
            </div>
            
            <div class="qr-section">
              <div class="qr-label">Scan for Details</div>
              ${qrCodeUrl ? 
                `<div style="margin: 10px 0; text-align: center;">
                   <img src="${qrCodeUrl}" width="120" height="120" class="qr-code-img" alt="Receipt QR Code" 
                        style="max-width: 120px; height: auto; width: 120px; height: 120px; margin: 10px auto; display: block; border: 1px solid #ccc; background: #f9f9f9;"
                        onerror="console.error('QR Code failed to load - URL:', this.src); 
                                this.style.display='none'; 
                                var errorDiv = this.parentNode.querySelector('.qr-error'); 
                                if (errorDiv) errorDiv.style.display='block';
                                console.log('QR Code onerror triggered - src:', this.src);" 
                        onload="console.log('QR Code loaded successfully - src:', this.src);" />
                   <div class="qr-error" style="font-size: 8px; color: #666; margin: 5px 0; display: none;">QR Code failed to load</div>
                 </div>` : 
                `<div style="margin: 10px 0; text-align: center;">
                   <div style="font-size: 8px; color: #666;">
                     ${qrGenerationError ? 
                       `QR Code generation failed: ${qrGenerationError.substring(0, 50)}...` : 
                       'QR Code not available'}
                   </div>
                 </div>`}
              <div style="font-size: 8px; margin-top: 5px;">Order #: ${transaction.orderNumber || 'PO-' + Date.now()}</div>
            </div>
          </body>
        </html>
      `;
    }
    
    // Write content to iframe and print
    printDocument.open();
    printDocument.write(receiptContent);
    printDocument.close();
    
    // Wait for content to load before printing
    printFrame.onload = () => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (error) {
        console.error('Error during printing:', error);
      } finally {
        // Clean up - remove iframe after a short delay to ensure printing started
        setTimeout(() => {
          if (printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }
          this.hideLoadingIndicator();
        }, 1000);
      }
    };
    
    // Fallback cleanup in case onload doesn't fire
    setTimeout(() => {
      if (printFrame.parentNode) {
        printFrame.parentNode.removeChild(printFrame);
      }
      this.hideLoadingIndicator();
    }, 5000);
  }

  // Show loading indicator
  static showLoadingIndicator(message: string) {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    loadingIndicator.style.color = '#fff';
    loadingIndicator.style.padding = '10px';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.zIndex = '1000';
    loadingIndicator.textContent = message;
    document.body.appendChild(loadingIndicator);
  }

  // Hide loading indicator
  static hideLoadingIndicator() {
    const loadingIndicator = document.querySelector('div[style*="position: fixed; top: 50%; left: 50%;"]');
    if (loadingIndicator) {
      document.body.removeChild(loadingIndicator);
    }
  }

  // Fallback method for printing on mobile devices
  static printReceiptMobile(transaction: any, qrCodeUrl: string) {
    console.log('Using mobile print approach...');
    
    // Create a modal dialog for mobile printing with a clear print button
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    // Get template configuration
    const templateConfig = getTemplateConfig();
    
    let receiptContent;
    
    // Use custom template if enabled
    if (templateConfig.customTemplate) {
      receiptContent = generateCustomReceipt(transaction, templateConfig);
    } else {
      // Format items for receipt
      const formattedItems = transaction.items.map((item: any) => {
        const total = item.price * item.quantity;
        return {
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: total
        };
      });
      
      // Calculate totals
      const subtotal = transaction.subtotal || formattedItems.reduce((sum: number, item: any) => sum + item.total, 0);
      const tax = transaction.tax || 0;
      const discount = transaction.discount || 0;
      const total = transaction.total || (subtotal + tax - discount);
      const amountReceived = transaction.amountReceived || total;
      const change = transaction.change || (amountReceived - total);
      
      // Simplified mobile receipt content
      receiptContent = `
        <div style="background: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 80%; overflow-y: auto;">
          <h2 style="text-align: center; margin-bottom: 20px;">Receipt Preview</h2>
          <div style="font-family: monospace; font-size: 14px;">
            <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
              <div style="font-weight: bold; font-size: 18px;">POS BUSINESS</div>
              <div style="font-size: 12px;">123 Business St, City, Country</div>
              <div style="font-size: 12px;">Phone: (123) 456-7890</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px;">
              <div>Receipt #: ${transaction.receiptNumber || Date.now()}</div>
              <div>${new Date().toLocaleDateString()}</div>
            </div>
            
            <div style="margin-bottom: 15px;">
              ${formattedItems.map((item: any) => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <div>${item.name} (${item.quantity})</div>
                  <div>${item.total.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            
            <div style="border-top: 1px dashed #000; padding-top: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div>Subtotal:</div>
                <div>${subtotal.toFixed(2)}</div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div>Tax:</div>
                <div>${tax.toFixed(2)}</div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div>Discount:</div>
                <div>${discount.toFixed(2)}</div>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px;">
                <div>Total:</div>
                <div>${total.toFixed(2)}</div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 15px 0;">
              <div style="font-size: 12px; margin-bottom: 10px;">Scan for Details</div>
              ${qrCodeUrl ? 
                `<img src="${qrCodeUrl}" style="width: 120px; height: 120px; margin: 0 auto; display: block;" alt="Receipt QR Code" />` : 
                `<div style="font-size: 10px; color: #666;">QR Code not available</div>`}
            </div>
          </div>
          
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="cancelPrint" style="flex: 1; padding: 12px; background: #ccc; border: none; border-radius: 5px; font-size: 16px;">Cancel</button>
            <button id="confirmPrint" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; font-size: 16px;">Print Receipt</button>
          </div>
        </div>
      `;
    }
    
    modal.innerHTML = receiptContent;
    document.body.appendChild(modal);
    
    // Add event listeners
    const confirmBtn = modal.querySelector('#confirmPrint');
    const cancelBtn = modal.querySelector('#cancelPrint');
    
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        // Use the standard print method for mobile
        this.printReceipt(transaction);
        document.body.removeChild(modal);
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
  }

  // Fallback method for printing on mobile devices
  static printPurchaseReceiptMobile(transaction: any, qrCodeUrl: string) {
    console.log('Using mobile print approach for purchase receipt...');
    
    // Create a modal dialog for mobile printing with a clear print button
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    // Get purchase template configuration
    const templateConfig = getPurchaseTemplateConfig();
    
    let receiptContent;
    
    // Use custom template if enabled
    if (templateConfig.customTemplate) {
      receiptContent = generateCustomPurchaseReceipt(transaction, templateConfig);
    } else {
      // Format items for receipt
      const formattedItems = transaction.items || [];
      
      // Calculate totals
      const subtotal = transaction.subtotal || formattedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      // Display only tax (18% of subtotal) - for informational purposes only
      const displayTax = subtotal * 0.18;
      const discount = transaction.discount || 0;
      // Actual total calculation (tax not included in computation)
      const total = transaction.total || (subtotal - discount);
      const amountReceived = transaction.amountReceived || total;
      const change = transaction.change || (amountReceived - total);
      
      // Simplified mobile receipt content
      receiptContent = `
        <div style="background: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 80%; overflow-y: auto;">
          <h2 style="text-align: center; margin-bottom: 20px;">Purchase Receipt Preview</h2>
          <div style="font-family: monospace; font-size: 14px;">
            <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
              <div style="font-weight: bold; font-size: 18px;">POS BUSINESS</div>
              <div style="font-size: 12px;">123 Business St, City, Country</div>
              <div style="font-size: 12px;">Phone: (123) 456-7890</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px;">
              <div>Order #: ${transaction.orderNumber || 'PO-' + Date.now()}</div>
              <div>${new Date().toLocaleDateString()}</div>
            </div>
            
            <div style="margin-bottom: 15px;">
              ${formattedItems.map((item: any) => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <div>${item.name} (${item.quantity})</div>
                  <div>${item.total.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            
            <div style="border-top: 1px dashed #000; padding-top: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div>Subtotal:</div>
                <div>${subtotal.toFixed(2)}</div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div>Tax (18%):</div>
                <div>${displayTax.toFixed(2)}</div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div>Discount:</div>
                <div>${discount.toFixed(2)}</div>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px;">
                <div>Total:</div>
                <div>${total.toFixed(2)}</div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 15px 0;">
              <div style="font-size: 12px; margin-bottom: 10px;">Scan for Details</div>
              ${qrCodeUrl ? 
                `<img src="${qrCodeUrl}" style="width: 120px; height: 120px; margin: 0 auto; display: block;" alt="Receipt QR Code" />` : 
                `<div style="font-size: 10px; color: #666;">QR Code not available</div>`}
            </div>
          </div>
          
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="cancelPrint" style="flex: 1; padding: 12px; background: #ccc; border: none; border-radius: 5px; font-size: 16px;">Cancel</button>
            <button id="confirmPrint" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; font-size: 16px;">Print Receipt</button>
          </div>
        </div>
      `;
    }
    
    modal.innerHTML = receiptContent;
    document.body.appendChild(modal);
    
    // Add event listeners
    const confirmBtn = modal.querySelector('#confirmPrint');
    const cancelBtn = modal.querySelector('#cancelPrint');
    
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        // Use the standard print method for mobile
        this.printPurchaseReceipt(transaction);
        document.body.removeChild(modal);
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
  }

  // Fallback method for printing when popup blockers are enabled
  static printReceiptFallback(transaction: any, qrCodeUrl: string) {
    console.log('Popup blocked, trying fallback print...');
    // For now, just call the regular print method
    this.printReceipt(transaction);
  }

  // Fallback method for printing when popup blockers are enabled
  static printPurchaseReceiptFallback(transaction: any, qrCodeUrl: string) {
    console.log('Popup blocked, trying fallback print for purchase...');
    // For now, just call the regular print method
    this.printPurchaseReceipt(transaction);
  }

  // Print purchase report
  static printPurchaseReport(transactions: any[]) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const totalPurchases = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .summary {
              margin: 20px 0;
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Purchase Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Purchases:</strong> $${totalPurchases.toFixed(2)}</p>
            <p><strong>Total Transactions:</strong> ${totalTransactions}</p>
            <p><strong>Average Transaction:</strong> $${(totalPurchases / totalTransactions).toFixed(2)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => `
                <tr>
                  <td>${new Date(transaction.date).toLocaleDateString()}</td>
                  <td>${transaction.id}</td>
                  <td>${transaction.supplier}</td>
                  <td>${transaction.items} items</td>
                  <td>$${transaction.total.toFixed(2)}</td>
                  <td>${transaction.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }

  // Print sales report
  static printSalesReport(transactions: any[]) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .summary {
              margin: 20px 0;
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sales Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Sales:</strong> $${totalSales.toFixed(2)}</p>
            <p><strong>Total Transactions:</strong> ${totalTransactions}</p>
            <p><strong>Average Transaction:</strong> $${(totalSales / totalTransactions).toFixed(2)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => `
                <tr>
                  <td>${new Date(transaction.date).toLocaleDateString()}</td>
                  <td>${transaction.id}</td>
                  <td>${transaction.items.length} items</td>
                  <td>$${transaction.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }

  // Print financial report
  static printFinancialReport(reportData: any) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportData.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .report-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-period {
              font-size: 16px;
              color: #666;
              margin-bottom: 10px;
            }
            .report-data {
              margin: 20px 0;
            }
            .data-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .data-label {
              font-weight: bold;
            }
            .data-value {
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="report-title">${reportData.title}</div>
            <div class="report-period">${reportData.period || 'Current Period'}</div>
          </div>
          
          <div class="report-data">
            ${reportData.data.map((item: any) => `
              <div class="data-row">
                <span class="data-label">${item.name}:</span>
                <span class="data-value">$${item.value.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Confidential - For Internal Use Only</p>
          </div>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }

  // Print income statement
  static printIncomeStatement(data: any) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Income Statement</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              font-size: 14px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .business-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-period {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .report-table th {
              text-align: left;
              border-bottom: 1px solid #333;
              padding: 8px 0;
            }
            .report-table td {
              padding: 4px 0;
            }
            .text-right {
              text-align: right;
            }
            .font-semibold {
              font-weight: 600;
            }
            .font-bold {
              font-weight: bold;
            }
            .pl-4 {
              padding-left: 30px;
            }
            .border-b {
              border-bottom: 1px solid #ccc;
            }
            .border-t-2 {
              border-top: 2px solid #333;
            }
            .border-b-2 {
              border-bottom: 2px solid #333;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-name">${data.businessName}</div>
            <div class="report-title">INCOME STATEMENT</div>
            <div class="report-period">For the period ended ${data.period}</div>
          </div>
          
          <table class="report-table">
            <thead>
              <tr>
                <th>Account</th>
                <th class="text-right">Amount (TZS)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-semibold">Revenue / Sales</td>
                <td></td>
              </tr>
              <tr>
                <td class="pl-4">Total Sales</td>
                <td></td>
                <td class="text-right">${data.revenue.totalSales.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Less: Sales Returns & Allowances</td>
                <td class="text-right">(${data.revenue.salesReturns.toLocaleString()})</td>
              </tr>
              <tr>
                <td class="pl-4 font-semibold border-b">Net Sales</td>
                <td></td>
                <td class="text-right font-semibold border-b">${data.revenue.netSales.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="font-semibold">Cost of Goods Sold (COGS)</td>
                <td></td>
              </tr>
              <tr>
                <td class="pl-4">Opening Stock</td>
                <td></td>
                <td class="text-right">${data.cogs.openingStock.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Add: Purchases</td>
                <td></td>
                <td class="text-right">${data.cogs.purchases.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Less: Closing Stock</td>
                <td class="text-right">(${data.cogs.closingStock.toLocaleString()})</td>
              </tr>
              <tr>
                <td class="pl-4 font-semibold border-b">Cost of Goods Sold</td>
                <td></td>
                <td class="text-right font-semibold border-b">${data.cogs.costOfGoodsSold.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="font-semibold">Gross Profit</td>
                <td></td>
                <td class="text-right font-semibold">${data.grossProfit.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="font-semibold">Operating Expenses:</td>
                <td></td>
              </tr>
              <tr>
                <td class="pl-4">Salaries & Wages</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.salaries.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Rent Expense</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.rent.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Utilities (Electricity, Water, etc)</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.utilities.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Depreciation</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.depreciation.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Other Operating Expenses</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.other.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4 font-semibold border-b">Total Operating Expenses</td>
                <td></td>
                <td class="text-right font-semibold border-b">${data.operatingExpenses.total.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="font-semibold">Operating Profit</td>
                <td></td>
                <td class="text-right font-semibold">${data.operatingProfit.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="font-semibold">Other Income</td>
                <td></td>
                <td class="text-right">${data.otherIncome.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="font-semibold">Other Expenses</td>
                <td></td>
                <td class="text-right">(${data.otherExpenses.toLocaleString()})</td>
              </tr>
              <tr>
                <td class="font-semibold border-t">Profit Before Tax</td>
                <td></td>
                <td class="text-right font-semibold border-t">${data.profitBeforeTax.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="font-semibold">Income Tax</td>
                <td class="text-right">(${data.incomeTax.toLocaleString()})</td>
              </tr>
              <tr>
                <td class="font-bold border-t-2">NET PROFIT</td>
                <td></td>
                <td class="text-right font-bold border-t-2">${data.netProfit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Confidential - For Internal Use Only</p>
          </div>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }

  // Print purchase order
  static printPurchaseOrder(poData: any) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order ${poData.orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              font-size: 14px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .business-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .info-section {
              flex: 1;
            }
            .info-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .report-table th {
              text-align: left;
              border-bottom: 1px solid #333;
              padding: 8px;
              background-color: #f5f5f5;
            }
            .report-table td {
              padding: 8px;
              border-bottom: 1px solid #eee;
            }
            .text-right {
              text-align: right;
            }
            .font-semibold {
              font-weight: 600;
            }
            .font-bold {
              font-weight: bold;
            }
            .border-t {
              border-top: 1px solid #333;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
            .total-section {
              margin-top: 20px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 5px;
            }
            .total-label {
              width: 150px;
              font-weight: bold;
            }
            .total-value {
              width: 100px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-name">POS BUSINESS</div>
            <div class="report-title">PURCHASE ORDER</div>
            <div>Order #: ${poData.orderNumber}</div>
          </div>
          
          <div class="report-info">
            <div class="info-section">
              <div class="info-label">Supplier</div>
              <div>${poData.supplier.name}</div>
            </div>
            <div class="info-section">
              <div class="info-label">Date</div>
              <div>${new Date(poData.date).toLocaleDateString()}</div>
            </div>
          </div>
          
          <table class="report-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${poData.items.map((item: any) => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unitPrice.toFixed(2)}</td>
                  <td class="text-right">${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <div class="total-label">Total:</div>
              <div class="total-value">${poData.total.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }
}