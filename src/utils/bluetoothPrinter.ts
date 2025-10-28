// Bluetooth printer utility for ESC/POS thermal printers
export class BluetoothPrinter {
  private static device: BluetoothDevice | null = null;
  private static characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  // Check if Web Bluetooth is supported
  static isBluetoothSupported(): boolean {
    return 'bluetooth' in navigator && navigator.bluetooth !== undefined;
  }

  // Connect to a Bluetooth printer
  static async connect(): Promise<boolean> {
    try {
      if (!this.isBluetoothSupported()) {
        throw new Error('Web Bluetooth is not supported in this browser');
      }

      // Request a Bluetooth device with the required services
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic ESC/POS service
          { namePrefix: 'PT-' }, // Common printer name prefixes
          { namePrefix: 'MTP-' },
          { namePrefix: 'TM-' },
          { namePrefix: 'XP-' }
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 0x18f0]
      });

      // Connect to the GATT server
      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Get the primary service
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      
      // Get the characteristic for writing data
      this.characteristic = await service.getCharacteristic(0x2af0);
      
      console.log('Successfully connected to Bluetooth printer');
      return true;
    } catch (error) {
      console.error('Error connecting to Bluetooth printer:', error);
      return false;
    }
  }

  // Disconnect from the printer
  static async disconnect(): Promise<void> {
    try {
      if (this.device && this.device.gatt?.connected) {
        await this.device.gatt.disconnect();
        this.device = null;
        this.characteristic = null;
        console.log('Disconnected from Bluetooth printer');
      }
    } catch (error) {
      console.error('Error disconnecting from Bluetooth printer:', error);
    }
  }

  // Send raw data to the printer
  static async sendRawData(data: Uint8Array): Promise<boolean> {
    try {
      if (!this.characteristic) {
        throw new Error('Not connected to a printer');
      }

      await this.characteristic.writeValueWithoutResponse(data);
      return true;
    } catch (error) {
      console.error('Error sending data to printer:', error);
      return false;
    }
  }

  // Send text to the printer
  static async sendText(text: string): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      return await this.sendRawData(data);
    } catch (error) {
      console.error('Error sending text to printer:', error);
      return false;
    }
  }

  // Send ESC/POS commands to the printer
  static async sendCommands(commands: number[]): Promise<boolean> {
    try {
      const data = new Uint8Array(commands);
      return await this.sendRawData(data);
    } catch (error) {
      console.error('Error sending ESC/POS commands:', error);
      return false;
    }
  }

  // Print a receipt using ESC/POS commands
  static async printReceipt(transaction: any, businessInfo: any): Promise<boolean> {
    try {
      // Initialize printer
      await this.sendCommands([0x1B, 0x40]); // Initialize printer
      
      // Set alignment to center for business info
      await this.sendCommands([0x1B, 0x61, 0x01]);
      
      // Print business information
      if (businessInfo.name) {
        await this.sendText(businessInfo.name + '\n');
      }
      if (businessInfo.address) {
        await this.sendText(businessInfo.address + '\n');
      }
      if (businessInfo.phone) {
        await this.sendText(businessInfo.phone + '\n');
      }
      
      // Add separator line
      await this.sendText('--------------------------------\n');
      
      // Set alignment to left for transaction details
      await this.sendCommands([0x1B, 0x61, 0x00]);
      
      // Print transaction details
      await this.sendText(`Receipt #: ${transaction.receiptNumber || Date.now()}\n`);
      await this.sendText(`Date: ${new Date().toLocaleDateString()}\n`);
      await this.sendText(`Time: ${new Date().toLocaleTimeString()}\n`);
      
      // Add separator line
      await this.sendText('--------------------------------\n');
      
      // Print items
      if (transaction.items && transaction.items.length > 0) {
        for (const item of transaction.items) {
          const name = item.name?.substring(0, 16) || '';
          const qty = item.quantity?.toString() || '1';
          const price = item.price?.toFixed(2) || '0.00';
          const total = (item.price * item.quantity)?.toFixed(2) || '0.00';
          
          // Print item line
          await this.sendText(`${name}\n`);
          await this.sendText(`  ${qty} x ${price} = ${total}\n`);
        }
      }
      
      // Add separator line
      await this.sendText('--------------------------------\n');
      
      // Print totals
      const subtotal = transaction.subtotal?.toFixed(2) || '0.00';
      const tax = transaction.tax?.toFixed(2) || '0.00';
      const discount = transaction.discount?.toFixed(2) || '0.00';
      const total = transaction.total?.toFixed(2) || '0.00';
      const amountReceived = transaction.amountReceived?.toFixed(2) || total;
      const change = transaction.change?.toFixed(2) || '0.00';
      
      await this.sendText(`Subtotal: ${subtotal}\n`);
      await this.sendText(`Tax: ${tax}\n`);
      await this.sendText(`Discount: ${discount}\n`);
      await this.sendText(`Total: ${total}\n`);
      await this.sendText(`Amount Received: ${amountReceived}\n`);
      await this.sendText(`Change: ${change}\n`);
      
      // Add separator line
      await this.sendText('--------------------------------\n');
      
      // Set alignment to center for footer
      await this.sendCommands([0x1B, 0x61, 0x01]);
      
      // Print footer
      await this.sendText('Thank you for your business!\n');
      await this.sendText('Items sold are not returnable\n');
      
      // Feed paper and cut
      await this.sendCommands([0x1B, 0x64, 0x02]); // Feed 2 lines
      await this.sendCommands([0x1B, 0x69]); // Partial cut
      
      return true;
    } catch (error) {
      console.error('Error printing receipt:', error);
      return false;
    }
  }

  // Print a purchase receipt
  static async printPurchaseReceipt(transaction: any, businessInfo: any): Promise<boolean> {
    try {
      // Initialize printer
      await this.sendCommands([0x1B, 0x40]); // Initialize printer
      
      // Set alignment to center for business info
      await this.sendCommands([0x1B, 0x61, 0x01]);
      
      // Print business information
      if (businessInfo.name) {
        await this.sendText(businessInfo.name + '\n');
      }
      if (businessInfo.address) {
        await this.sendText(businessInfo.address + '\n');
      }
      if (businessInfo.phone) {
        await this.sendText(businessInfo.phone + '\n');
      }
      
      // Add separator line
      await this.sendText('--------------------------------\n');
      
      // Set alignment to left for transaction details
      await this.sendCommands([0x1B, 0x61, 0x00]);
      
      // Print purchase order details
      await this.sendText(`Order #: ${transaction.orderNumber || 'PO-' + Date.now()}\n`);
      await this.sendText(`Date: ${new Date().toLocaleDateString()}\n`);
      await this.sendText(`Time: ${new Date().toLocaleTimeString()}\n`);
      
      // Print supplier info if available
      if (transaction.supplier) {
        await this.sendText(`Supplier: ${transaction.supplier}\n`);
      }
      
      // Add separator line
      await this.sendText('--------------------------------\n');
      
      // Print items
      if (transaction.items && transaction.items.length > 0) {
        for (const item of transaction.items) {
          const name = item.name?.substring(0, 16) || '';
          const qty = item.quantity?.toString() || '1';
          const price = item.price?.toFixed(2) || '0.00';
          const total = (item.price * item.quantity)?.toFixed(2) || '0.00';
          
          // Print item line
          await this.sendText(`${name}\n`);
          await this.sendText(`  ${qty} x ${price} = ${total}\n`);
        }
      }
      
      // Add separator line
      await this.sendText('--------------------------------\n');
      
      // Print totals
      const subtotal = transaction.subtotal?.toFixed(2) || '0.00';
      const discount = transaction.discount?.toFixed(2) || '0.00';
      const total = transaction.total?.toFixed(2) || '0.00';
      const amountReceived = transaction.amountReceived?.toFixed(2) || total;
      const change = transaction.change?.toFixed(2) || '0.00';
      
      await this.sendText(`Subtotal: ${subtotal}\n`);
      await this.sendText(`Discount: ${discount}\n`);
      await this.sendText(`Total: ${total}\n`);
      await this.sendText(`Amount Paid: ${amountReceived}\n`);
      await this.sendText(`Change: ${change}\n`);
      
      // Add separator line
      await this.sendText('--------------------------------\n');
      
      // Set alignment to center for footer
      await this.sendCommands([0x1B, 0x61, 0x01]);
      
      // Print footer
      await this.sendText('Thank you for your business!\n');
      await this.sendText('Items purchased are not returnable\n');
      
      // Feed paper and cut
      await this.sendCommands([0x1B, 0x64, 0x02]); // Feed 2 lines
      await this.sendCommands([0x1B, 0x69]); // Partial cut
      
      return true;
    } catch (error) {
      console.error('Error printing purchase receipt:', error);
      return false;
    }
  }

  // Check if we're connected to a printer
  static isConnected(): boolean {
    return this.device !== null && this.device.gatt?.connected === true;
  }

  // Get the connected device name
  static getDeviceName(): string | null {
    return this.device?.name || null;
  }
}