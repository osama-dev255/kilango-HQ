import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Building, 
  Printer, 
  Bell, 
  Database, 
  Shield, 
  Palette,
  Save,
  RotateCcw,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { saveTemplateConfig, savePurchaseTemplateConfig } from "@/utils/templateUtils";
// Import language context
import { useLanguage } from "@/contexts/LanguageContext";

interface SettingsProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

export const Settings = ({ username, onBack, onLogout }: SettingsProps) => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<"sales" | "purchase">("sales");
  
  // Bluetooth printer state
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<string | null>(null);
  const [enableBluetoothPrinting, setEnableBluetoothPrinting] = useState(false);
  const [autoPrintReceipts, setAutoPrintReceipts] = useState(true);
  const [printerPaperWidth, setPrinterPaperWidth] = useState("80mm");
  const [printDensity, setPrintDensity] = useState("medium");
  
  // General settings
  const [businessName, setBusinessName] = useState("My Business");
  const [businessAddress, setBusinessAddress] = useState("123 Main St, City, Country");
  const [businessPhone, setBusinessPhone] = useState("+1234567890");
  const [currency, setCurrency] = useState("TZS");
  const [timezone, setTimezone] = useState("Africa/Dar_es_Salaam");
  
  // Receipt settings
  const [printReceipts, setPrintReceipts] = useState(true);
  const [printPurchaseReceipts, setPrintPurchaseReceipts] = useState(true);
  const [receiptHeader, setReceiptHeader] = useState("Thank you for your business!");
  const [showLogo, setShowLogo] = useState(true);
  
  // Custom receipt template settings
  const [customTemplate, setCustomTemplate] = useState(false);
  const [templateHeader, setTemplateHeader] = useState("POS BUSINESS\n123 Business St, City, Country\nPhone: (123) 456-7890");
  const [templateFooter, setTemplateFooter] = useState("Thank you for your business!\nItems sold are not returnable\nVisit us again soon");
  const [showBusinessInfo, setShowBusinessInfo] = useState(true);
  const [showTransactionDetails, setShowTransactionDetails] = useState(true);
  const [showItemDetails, setShowItemDetails] = useState(true);
  const [showTotals, setShowTotals] = useState(true);
  const [showPaymentInfo, setShowPaymentInfo] = useState(true);
  const [fontSize, setFontSize] = useState("12px");
  const [paperWidth, setPaperWidth] = useState("320px");
  
  // Custom purchase receipt template settings
  const [customPurchaseTemplate, setCustomPurchaseTemplate] = useState(false);
  const [purchaseTemplateHeader, setPurchaseTemplateHeader] = useState("POS BUSINESS\n123 Business St, City, Country\nPhone: (123) 456-7890");
  const [purchaseTemplateFooter, setPurchaseTemplateFooter] = useState("Thank you for your business!\nItems purchased are not returnable\nVisit us again soon");
  const [showPurchaseBusinessInfo, setShowPurchaseBusinessInfo] = useState(true);
  const [showPurchaseTransactionDetails, setShowPurchaseTransactionDetails] = useState(true);
  const [showPurchaseItemDetails, setShowPurchaseItemDetails] = useState(true);
  const [showPurchaseTotals, setShowPurchaseTotals] = useState(true);
  const [showPurchasePaymentInfo, setShowPurchasePaymentInfo] = useState(true);
  const [showPurchaseSupplierInfo, setShowPurchaseSupplierInfo] = useState(true);
  const [purchaseFontSize, setPurchaseFontSize] = useState("12px");
  const [purchasePaperWidth, setPurchasePaperWidth] = useState("320px");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [dailyReports, setDailyReports] = useState(true);
  
  // Security settings
  const [requirePassword, setRequirePassword] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  // Display settings
  const [darkMode, setDarkMode] = useState(false);
  const [displayFontSize, setDisplayFontSize] = useState("medium");
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      // Check if Bluetooth is supported
      setIsBluetoothSupported('bluetooth' in navigator);
      
      // Load general settings
      const savedBusinessName = localStorage.getItem('businessName');
      if (savedBusinessName) setBusinessName(savedBusinessName);
      
      const savedBusinessAddress = localStorage.getItem('businessAddress');
      if (savedBusinessAddress) setBusinessAddress(savedBusinessAddress);
      
      const savedBusinessPhone = localStorage.getItem('businessPhone');
      if (savedBusinessPhone) setBusinessPhone(savedBusinessPhone);
      
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency) setCurrency(savedCurrency);
      
      const savedTimezone = localStorage.getItem('timezone');
      if (savedTimezone) setTimezone(savedTimezone);
      
      // Load receipt settings
      const savedPrintReceipts = localStorage.getItem('printReceipts');
      if (savedPrintReceipts) setPrintReceipts(savedPrintReceipts === 'true');
      
      const savedPrintPurchaseReceipts = localStorage.getItem('printPurchaseReceipts');
      if (savedPrintPurchaseReceipts) setPrintPurchaseReceipts(savedPrintPurchaseReceipts === 'true');
      
      const savedReceiptHeader = localStorage.getItem('receiptHeader');
      if (savedReceiptHeader) setReceiptHeader(savedReceiptHeader);
      
      const savedShowLogo = localStorage.getItem('showLogo');
      if (savedShowLogo) setShowLogo(savedShowLogo === 'true');
      
      // Load template settings
      const savedCustomTemplate = localStorage.getItem('customTemplate');
      if (savedCustomTemplate) setCustomTemplate(savedCustomTemplate === 'true');
      
      const savedTemplateHeader = localStorage.getItem('templateHeader');
      if (savedTemplateHeader) setTemplateHeader(savedTemplateHeader);
      
      const savedTemplateFooter = localStorage.getItem('templateFooter');
      if (savedTemplateFooter) setTemplateFooter(savedTemplateFooter);
      
      const savedShowBusinessInfo = localStorage.getItem('showBusinessInfo');
      if (savedShowBusinessInfo) setShowBusinessInfo(savedShowBusinessInfo === 'true');
      
      const savedShowTransactionDetails = localStorage.getItem('showTransactionDetails');
      if (savedShowTransactionDetails) setShowTransactionDetails(savedShowTransactionDetails === 'true');
      
      const savedShowItemDetails = localStorage.getItem('showItemDetails');
      if (savedShowItemDetails) setShowItemDetails(savedShowItemDetails === 'true');
      
      const savedShowTotals = localStorage.getItem('showTotals');
      if (savedShowTotals) setShowTotals(savedShowTotals === 'true');
      
      const savedShowPaymentInfo = localStorage.getItem('showPaymentInfo');
      if (savedShowPaymentInfo) setShowPaymentInfo(savedShowPaymentInfo === 'true');
      
      const savedFontSize = localStorage.getItem('fontSize');
      if (savedFontSize) setFontSize(savedFontSize);
      
      const savedPaperWidth = localStorage.getItem('paperWidth');
      if (savedPaperWidth) setPaperWidth(savedPaperWidth);
      
      // Load purchase template settings
      const savedCustomPurchaseTemplate = localStorage.getItem('customPurchaseTemplate');
      if (savedCustomPurchaseTemplate) setCustomPurchaseTemplate(savedCustomPurchaseTemplate === 'true');
      
      const savedPurchaseTemplateHeader = localStorage.getItem('purchaseTemplateHeader');
      if (savedPurchaseTemplateHeader) setPurchaseTemplateHeader(savedPurchaseTemplateHeader);
      
      const savedPurchaseTemplateFooter = localStorage.getItem('purchaseTemplateFooter');
      if (savedPurchaseTemplateFooter) setPurchaseTemplateFooter(savedPurchaseTemplateFooter);
      
      const savedShowPurchaseBusinessInfo = localStorage.getItem('showPurchaseBusinessInfo');
      if (savedShowPurchaseBusinessInfo) setShowPurchaseBusinessInfo(savedShowPurchaseBusinessInfo === 'true');
      
      const savedShowPurchaseTransactionDetails = localStorage.getItem('showPurchaseTransactionDetails');
      if (savedShowPurchaseTransactionDetails) setShowPurchaseTransactionDetails(savedShowPurchaseTransactionDetails === 'true');
      
      const savedShowPurchaseItemDetails = localStorage.getItem('showPurchaseItemDetails');
      if (savedShowPurchaseItemDetails) setShowPurchaseItemDetails(savedShowPurchaseItemDetails === 'true');
      
      const savedShowPurchaseTotals = localStorage.getItem('showPurchaseTotals');
      if (savedShowPurchaseTotals) setShowPurchaseTotals(savedShowPurchaseTotals === 'true');
      
      const savedShowPurchasePaymentInfo = localStorage.getItem('showPurchasePaymentInfo');
      if (savedShowPurchasePaymentInfo) setShowPurchasePaymentInfo(savedShowPurchasePaymentInfo === 'true');
      
      const savedShowPurchaseSupplierInfo = localStorage.getItem('showPurchaseSupplierInfo');
      if (savedShowPurchaseSupplierInfo) setShowPurchaseSupplierInfo(savedShowPurchaseSupplierInfo === 'true');
      
      const savedPurchaseFontSize = localStorage.getItem('purchaseFontSize');
      if (savedPurchaseFontSize) setPurchaseFontSize(savedPurchaseFontSize);
      
      const savedPurchasePaperWidth = localStorage.getItem('purchasePaperWidth');
      if (savedPurchasePaperWidth) setPurchasePaperWidth(savedPurchasePaperWidth);
      
      // Load notification settings
      const savedEmailNotifications = localStorage.getItem('emailNotifications');
      if (savedEmailNotifications) setEmailNotifications(savedEmailNotifications === 'true');
      
      const savedLowStockAlerts = localStorage.getItem('lowStockAlerts');
      if (savedLowStockAlerts) setLowStockAlerts(savedLowStockAlerts === 'true');
      
      const savedDailyReports = localStorage.getItem('dailyReports');
      if (savedDailyReports) setDailyReports(savedDailyReports === 'true');
      
      // Load security settings
      const savedRequirePassword = localStorage.getItem('requirePassword');
      if (savedRequirePassword) setRequirePassword(savedRequirePassword === 'true');
      
      const savedSessionTimeout = localStorage.getItem('sessionTimeout');
      if (savedSessionTimeout) setSessionTimeout(savedSessionTimeout);
      
      const savedTwoFactorAuth = localStorage.getItem('twoFactorAuth');
      if (savedTwoFactorAuth) setTwoFactorAuth(savedTwoFactorAuth === 'true');
      
      // Load display settings
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
      
      const savedDisplayFontSize = localStorage.getItem('displayFontSize');
      if (savedDisplayFontSize) setDisplayFontSize(savedDisplayFontSize as "small" | "medium" | "large");
      
      // Load printer settings
      const savedEnableBluetoothPrinting = localStorage.getItem('enableBluetoothPrinting');
      if (savedEnableBluetoothPrinting) setEnableBluetoothPrinting(savedEnableBluetoothPrinting === 'true');
      
      const savedAutoPrintReceipts = localStorage.getItem('autoPrintReceipts');
      if (savedAutoPrintReceipts) setAutoPrintReceipts(savedAutoPrintReceipts === 'true');
      
      const savedPrinterPaperWidth = localStorage.getItem('printerPaperWidth');
      if (savedPrinterPaperWidth) setPrinterPaperWidth(savedPrinterPaperWidth);
      
      const savedPrintDensity = localStorage.getItem('printDensity');
      if (savedPrintDensity) setPrintDensity(savedPrintDensity);
    };
    
    loadSettings();
  }, []);
  
  const handleConnectPrinter = async () => {
    try {
      setIsConnecting(true);
      
      // Dynamically import the BluetoothPrinter to avoid issues in environments where it's not supported
      const { BluetoothPrinter } = await import('@/utils/bluetoothPrinter');
      
      const success = await BluetoothPrinter.connect();
      if (success) {
        setIsPrinterConnected(true);
        setPrinterStatus(BluetoothPrinter.getDeviceName());
        toast({
          title: t("printerConnected"),
          description: t("printerConnectedDescription"),
        });
      } else {
        toast({
          title: t("connectionFailed"),
          description: t("connectionFailedDescription"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error connecting to printer:', error);
      toast({
        title: t("connectionError"),
        description: error instanceof Error ? error.message : t("unknownError"),
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectPrinter = async () => {
    try {
      // Dynamically import the BluetoothPrinter
      const { BluetoothPrinter } = await import('@/utils/bluetoothPrinter');
      
      await BluetoothPrinter.disconnect();
      setIsPrinterConnected(false);
      setPrinterStatus(null);
      toast({
        title: t("printerDisconnected"),
        description: t("printerDisconnectedDescription"),
      });
    } catch (error) {
      console.error('Error disconnecting from printer:', error);
      toast({
        title: t("disconnectionError"),
        description: error instanceof Error ? error.message : t("unknownError"),
        variant: "destructive",
      });
    }
  };
  
  const handleSave = () => {
    // Save general settings
    localStorage.setItem('businessName', businessName);
    localStorage.setItem('businessAddress', businessAddress);
    localStorage.setItem('businessPhone', businessPhone);
    localStorage.setItem('currency', currency);
    localStorage.setItem('timezone', timezone);
    
    // Save receipt settings
    localStorage.setItem('printReceipts', printReceipts.toString());
    localStorage.setItem('printPurchaseReceipts', printPurchaseReceipts.toString());
    localStorage.setItem('receiptHeader', receiptHeader);
    localStorage.setItem('showLogo', showLogo.toString());
    
    // Save template settings
    localStorage.setItem('customTemplate', customTemplate.toString());
    localStorage.setItem('templateHeader', templateHeader);
    localStorage.setItem('templateFooter', templateFooter);
    localStorage.setItem('showBusinessInfo', showBusinessInfo.toString());
    localStorage.setItem('showTransactionDetails', showTransactionDetails.toString());
    localStorage.setItem('showItemDetails', showItemDetails.toString());
    localStorage.setItem('showTotals', showTotals.toString());
    localStorage.setItem('showPaymentInfo', showPaymentInfo.toString());
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('paperWidth', paperWidth);
    
    // Save purchase template settings
    localStorage.setItem('customPurchaseTemplate', customPurchaseTemplate.toString());
    localStorage.setItem('purchaseTemplateHeader', purchaseTemplateHeader);
    localStorage.setItem('purchaseTemplateFooter', purchaseTemplateFooter);
    localStorage.setItem('showPurchaseBusinessInfo', showPurchaseBusinessInfo.toString());
    localStorage.setItem('showPurchaseTransactionDetails', showPurchaseTransactionDetails.toString());
    localStorage.setItem('showPurchaseItemDetails', showPurchaseItemDetails.toString());
    localStorage.setItem('showPurchaseTotals', showPurchaseTotals.toString());
    localStorage.setItem('showPurchasePaymentInfo', showPurchasePaymentInfo.toString());
    localStorage.setItem('showPurchaseSupplierInfo', showPurchaseSupplierInfo.toString());
    localStorage.setItem('purchaseFontSize', purchaseFontSize);
    localStorage.setItem('purchasePaperWidth', purchasePaperWidth);
    
    // Save notification settings
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('lowStockAlerts', lowStockAlerts.toString());
    localStorage.setItem('dailyReports', dailyReports.toString());
    
    // Save security settings
    localStorage.setItem('requirePassword', requirePassword.toString());
    localStorage.setItem('sessionTimeout', sessionTimeout);
    localStorage.setItem('twoFactorAuth', twoFactorAuth.toString());
    
    // Save display settings
    localStorage.setItem('darkMode', darkMode.toString());
    localStorage.setItem('displayFontSize', displayFontSize);
    
    // Save printer settings
    localStorage.setItem('enableBluetoothPrinting', enableBluetoothPrinting.toString());
    localStorage.setItem('autoPrintReceipts', autoPrintReceipts.toString());
    localStorage.setItem('printerPaperWidth', printerPaperWidth);
    localStorage.setItem('printDensity', printDensity);
    
    toast({
      title: t("settingsSaved"),
      description: t("settingsSavedDescription"),
    });
  };
  
  const handleReset = () => {
    // Reset to default values
    setBusinessName("My Business");
    setBusinessAddress("123 Main St, City, Country");
    setBusinessPhone("+1234567890");
    setCurrency("TZS");
    setTimezone("Africa/Dar_es_Salaam");
    setPrintReceipts(true);
    setPrintPurchaseReceipts(true);
    setReceiptHeader("Thank you for your business!");
    setShowLogo(true);
    
    // Reset template settings
    setCustomTemplate(false);
    setTemplateHeader("POS BUSINESS\n123 Business St, City, Country\nPhone: (123) 456-7890");
    setTemplateFooter("Thank you for your business!\nItems sold are not returnable\nVisit us again soon");
    setShowBusinessInfo(true);
    setShowTransactionDetails(true);
    setShowItemDetails(true);
    setShowTotals(true);
    setShowPaymentInfo(true);
    setFontSize("12px");
    setPaperWidth("320px");
    
    // Reset purchase template settings
    setCustomPurchaseTemplate(false);
    setPurchaseTemplateHeader("POS BUSINESS\n123 Business St, City, Country\nPhone: (123) 456-7890");
    setPurchaseTemplateFooter("Thank you for your business!\nItems purchased are not returnable\nVisit us again soon");
    setShowPurchaseBusinessInfo(true);
    setShowPurchaseTransactionDetails(true);
    setShowPurchaseItemDetails(true);
    setShowPurchaseTotals(true);
    setShowPurchasePaymentInfo(true);
    setShowPurchaseSupplierInfo(true);
    setPurchaseFontSize("12px");
    setPurchasePaperWidth("320px");
    
    setEmailNotifications(true);
    setLowStockAlerts(true);
    setDailyReports(true);
    setRequirePassword(true);
    setSessionTimeout("30");
    setTwoFactorAuth(false);
    setDarkMode(false);
    setLanguage("en");
    setDisplayFontSize("medium");
    
    toast({
      title: t("settingsReset"),
      description: t("settingsResetDescription"),
    });
  };
  
  // Add this new function to handle preview
  const handlePreview = (type: "sales" | "purchase") => {
    setPreviewType(type);
    setIsPreviewOpen(true);
  };
  
  const tabs = [
    { id: "general", label: t("general"), icon: Building },
    { id: "receipt", label: t("receipt"), icon: Printer },
    { id: "purchaseReceipt", label: t("purchaseReceipt"), icon: Printer },
    { id: "printer", label: t("printer"), icon: Printer },
    { id: "notifications", label: t("notifications"), icon: Bell },
    { id: "security", label: t("security"), icon: Shield },
    { id: "display", label: t("display"), icon: Palette },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={t("systemSettings")} 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("systemSettings")}</h2>
          <p className="text-muted-foreground">
            {t("configureSystemPreferences")}
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>{t("settingsCategories")}</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className={`flex items-center w-full px-3 py-2 rounded-md text-left ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Settings Content */}
          <div className="lg:w-3/4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {tabs.find(tab => tab.id === activeTab)?.label} {t("settings")}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t("reset")}
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      {t("saveChanges")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="business-name">{t("businessName")}</Label>
                        <Input
                          id="business-name"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-phone">{t("businessPhone")}</Label>
                        <Input
                          id="business-phone"
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business-address">{t("businessAddress")}</Label>
                      <Input
                        id="business-address"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currency">{t("currency")}</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TZS">TZS (Tanzanian Shilling)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">{t("timezone")}</Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Africa/Dar_es_Salaam">Dar es Salaam (GMT+3)</SelectItem>
                            <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "receipt" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("printReceipts")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("printReceiptsDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={printReceipts}
                        onCheckedChange={setPrintReceipts}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receipt-header">{t("receiptHeader")}</Label>
                      <Input
                        id="receipt-header"
                        value={receiptHeader}
                        onChange={(e) => setReceiptHeader(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("showLogo")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("showLogoDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={showLogo}
                        onCheckedChange={setShowLogo}
                      />
                    </div>
                    
                    {/* Custom Receipt Template Settings */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">{t("customReceiptTemplate")}</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Label>{t("enableCustomTemplate")}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t("enableCustomTemplateDescription")}
                          </p>
                        </div>
                        <Switch
                          checked={customTemplate}
                          onCheckedChange={setCustomTemplate}
                        />
                      </div>
                      
                      {customTemplate && (
                        <div className="space-y-4 pl-2 border-l-2 border-primary ml-2">
                          <div className="space-y-2">
                            <Label htmlFor="template-header">{t("receiptHeaderTemplate")}</Label>
                            <textarea
                              id="template-header"
                              value={templateHeader}
                              onChange={(e) => setTemplateHeader(e.target.value)}
                              className="w-full min-h-[80px] p-2 border rounded-md"
                              placeholder={t("enterReceiptHeader")}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="template-footer">{t("receiptFooter")}</Label>
                            <textarea
                              id="template-footer"
                              value={templateFooter}
                              onChange={(e) => setTemplateFooter(e.target.value)}
                              className="w-full min-h-[80px] p-2 border rounded-md"
                              placeholder={t("enterReceiptFooter")}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="font-size">{t("fontSize")}</Label>
                              <Select value={fontSize} onValueChange={setFontSize}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10px">10px ({t("small")})</SelectItem>
                                  <SelectItem value="12px">12px ({t("medium")})</SelectItem>
                                  <SelectItem value="14px">14px ({t("large")})</SelectItem>
                                  <SelectItem value="16px">16px ({t("extraLarge")})</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="paper-width">{t("paperWidth")}</Label>
                              <Select value={paperWidth} onValueChange={setPaperWidth}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="280px">280px ({t("narrow")})</SelectItem>
                                  <SelectItem value="320px">320px ({t("standard")})</SelectItem>
                                  <SelectItem value="360px">360px ({t("wide")})</SelectItem>
                                  <SelectItem value="400px">400px ({t("extraWide")})</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showBusinessInfo")}</Label>
                              </div>
                              <Switch
                                checked={showBusinessInfo}
                                onCheckedChange={setShowBusinessInfo}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showTransactionDetails")}</Label>
                              </div>
                              <Switch
                                checked={showTransactionDetails}
                                onCheckedChange={setShowTransactionDetails}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showItemDetails")}</Label>
                              </div>
                              <Switch
                                checked={showItemDetails}
                                onCheckedChange={setShowItemDetails}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showTotals")}</Label>
                              </div>
                              <Switch
                                checked={showTotals}
                                onCheckedChange={setShowTotals}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showPaymentInfo")}</Label>
                              </div>
                              <Switch
                                checked={showPaymentInfo}
                                onCheckedChange={setShowPaymentInfo}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === "purchaseReceipt" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("printPurchaseReceipts")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("printPurchaseReceiptsDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={printPurchaseReceipts}
                        onCheckedChange={setPrintPurchaseReceipts}
                      />
                    </div>
                    
                    {/* Custom Purchase Receipt Template Settings */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">{t("customPurchaseReceiptTemplate")}</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Label>{t("enableCustomPurchaseTemplate")}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t("enableCustomPurchaseTemplateDescription")}
                          </p>
                        </div>
                        <Switch
                          checked={customPurchaseTemplate}
                          onCheckedChange={setCustomPurchaseTemplate}
                        />
                      </div>
                      
                      {customPurchaseTemplate && (
                        <div className="space-y-4 pl-2 border-l-2 border-primary ml-2">
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              onClick={() => handlePreview("purchase")}
                              className="mb-4"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t("previewTemplate")}
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="purchase-template-header">{t("receiptHeaderTemplate")}</Label>
                            <textarea
                              id="purchase-template-header"
                              value={purchaseTemplateHeader}
                              onChange={(e) => setPurchaseTemplateHeader(e.target.value)}
                              className="w-full min-h-[80px] p-2 border rounded-md"
                              placeholder={t("enterReceiptHeader")}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="purchase-template-footer">{t("receiptFooter")}</Label>
                            <textarea
                              id="purchase-template-footer"
                              value={purchaseTemplateFooter}
                              onChange={(e) => setPurchaseTemplateFooter(e.target.value)}
                              className="w-full min-h-[80px] p-2 border rounded-md"
                              placeholder={t("enterReceiptFooter")}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="purchase-font-size">{t("fontSize")}</Label>
                              <Select value={purchaseFontSize} onValueChange={setPurchaseFontSize}>
                                <SelectTrigger id="purchase-font-size">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10px">10px ({t("small")})</SelectItem>
                                  <SelectItem value="12px">12px ({t("medium")})</SelectItem>
                                  <SelectItem value="14px">14px ({t("large")})</SelectItem>
                                  <SelectItem value="16px">16px ({t("extraLarge")})</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="purchase-paper-width">{t("paperWidth")}</Label>
                              <Select value={purchasePaperWidth} onValueChange={setPurchasePaperWidth}>
                                <SelectTrigger id="purchase-paper-width">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="280px">280px ({t("narrow")})</SelectItem>
                                  <SelectItem value="320px">320px ({t("standard")})</SelectItem>
                                  <SelectItem value="360px">360px ({t("wide")})</SelectItem>
                                  <SelectItem value="400px">400px ({t("extraWide")})</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showBusinessInfo")}</Label>
                              </div>
                              <Switch
                                checked={showPurchaseBusinessInfo}
                                onCheckedChange={setShowPurchaseBusinessInfo}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showTransactionDetails")}</Label>
                              </div>
                              <Switch
                                checked={showPurchaseTransactionDetails}
                                onCheckedChange={setShowPurchaseTransactionDetails}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showItemDetails")}</Label>
                              </div>
                              <Switch
                                checked={showPurchaseItemDetails}
                                onCheckedChange={setShowPurchaseItemDetails}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showTotals")}</Label>
                              </div>
                              <Switch
                                checked={showPurchaseTotals}
                                onCheckedChange={setShowPurchaseTotals}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showPaymentInfo")}</Label>
                              </div>
                              <Switch
                                checked={showPurchasePaymentInfo}
                                onCheckedChange={setShowPurchasePaymentInfo}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showSupplierInfo")}</Label>
                              </div>
                              <Switch
                                checked={showPurchaseSupplierInfo}
                                onCheckedChange={setShowPurchaseSupplierInfo}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === "printer" && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-800 mb-2">{t("bluetoothPrinterSetup")}</h3>
                      <p className="text-sm text-blue-600 mb-4">
                        {t("bluetoothPrinterSetupDescription")}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          onClick={handleConnectPrinter}
                          disabled={!isBluetoothSupported || isConnecting}
                          className="flex-1"
                        >
                          {isConnecting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {t("connecting")}
                            </>
                          ) : (
                            <>
                              <Printer className="h-4 w-4 mr-2" />
                              {t("connectPrinter")}
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={handleDisconnectPrinter}
                          disabled={!isPrinterConnected}
                          className="flex-1"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          {t("disconnectPrinter")}
                        </Button>
                      </div>
                      
                      {printerStatus && (
                        <div className="mt-4 p-3 bg-white rounded-md border">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${isPrinterConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium">
                              {isPrinterConnected 
                                ? `${t("connectedTo")} ${printerStatus}` 
                                : t("notConnected")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">{t("printerSettings")}</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>{t("enableBluetoothPrinting")}</Label>
                            <p className="text-sm text-muted-foreground">
                              {t("enableBluetoothPrintingDescription")}
                            </p>
                          </div>
                          <Switch
                            checked={enableBluetoothPrinting}
                            onCheckedChange={setEnableBluetoothPrinting}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>{t("autoPrintReceipts")}</Label>
                            <p className="text-sm text-muted-foreground">
                              {t("autoPrintReceiptsDescription")}
                            </p>
                          </div>
                          <Switch
                            checked={autoPrintReceipts}
                            onCheckedChange={setAutoPrintReceipts}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="paper-width">{t("paperWidth")}</Label>
                            <Select value={printerPaperWidth} onValueChange={setPrinterPaperWidth}>
                              <SelectTrigger id="paper-width">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="58mm">58mm ({t("narrow")})</SelectItem>
                                <SelectItem value="80mm">80mm ({t("standard")})</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="print-density">{t("printDensity")}</Label>
                            <Select value={printDensity} onValueChange={setPrintDensity}>
                              <SelectTrigger id="print-density">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">{t("light")}</SelectItem>
                                <SelectItem value="medium">{t("medium")}</SelectItem>
                                <SelectItem value="dark">{t("dark")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("emailNotifications")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("emailNotificationsDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("lowStockAlerts")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("lowStockAlertsDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={lowStockAlerts}
                        onCheckedChange={setLowStockAlerts}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("dailyReports")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("dailyReportsDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={dailyReports}
                        onCheckedChange={setDailyReports}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("requirePassword")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("requirePasswordDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={requirePassword}
                        onCheckedChange={setRequirePassword}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">{t("sessionTimeout")}</Label>
                      <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 {t("minutes")}</SelectItem>
                          <SelectItem value="15">15 {t("minutes")}</SelectItem>
                          <SelectItem value="30">30 {t("minutes")}</SelectItem>
                          <SelectItem value="60">60 {t("minutes")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("twoFactorAuth")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("twoFactorAuthDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorAuth}
                        onCheckedChange={setTwoFactorAuth}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === "display" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("darkMode")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("darkModeDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">{t("language")}</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="sw">Swahili</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="display-font-size">{t("displayFontSize")}</Label>
                      <Select value={displayFontSize} onValueChange={setDisplayFontSize}>
                        <SelectTrigger id="display-font-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">{t("small")}</SelectItem>
                          <SelectItem value="medium">{t("medium")}</SelectItem>
                          <SelectItem value="large">{t("large")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Template Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {previewType === "purchase" ? t("purchaseReceiptPreview") : t("salesReceiptPreview")}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-white">
              {previewType === "purchase" ? (
                <div 
                  className="receipt-preview" 
                  style={{ 
                    width: purchasePaperWidth, 
                    fontSize: purchaseFontSize,
                    fontFamily: 'monospace',
                    margin: '0 auto'
                  }}
                >
                  {showPurchaseBusinessInfo && (
                    <div className="text-center mb-2">
                      <div className="font-bold">{businessName}</div>
                      <div>{businessAddress}</div>
                      <div>{businessPhone}</div>
                    </div>
                  )}
                  
                  {showPurchaseTransactionDetails && (
                    <div className="mb-2">
                      <div className="border-t border-b py-1">
                        <div className="flex justify-between">
                          <span>{t("poNumber")}:</span>
                          <span>PO-001</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("date")}:</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("supplier")}:</span>
                          <span>ABC Supplier</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showPurchaseItemDetails && (
                    <div className="mb-2">
                      <div className="border-t border-b py-1">
                        <div className="font-bold mb-1">{t("items")}</div>
                        <div className="flex justify-between text-sm">
                          <span>Product A</span>
                          <span>2 × {formatCurrency(1500)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Product B</span>
                          <span>1 × {formatCurrency(3000)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Product C</span>
                          <span>3 × {formatCurrency(800)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showPurchaseTotals && (
                    <div className="mb-2">
                      <div className="border-t border-b py-1">
                        <div className="flex justify-between">
                          <span>{t("subtotal")}:</span>
                          <span>{formatCurrency(7500)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("tax")} (18%):</span>
                          <span>{formatCurrency(1350)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>{t("total")}:</span>
                          <span>{formatCurrency(8850)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showPurchaseSupplierInfo && (
                    <div className="mb-2 text-sm">
                      <div className="font-bold mb-1">{t("supplierInfo")}:</div>
                      <div>ABC Supplier</div>
                      <div>123 Supplier St, City</div>
                      <div>Phone: (987) 654-3210</div>
                    </div>
                  )}
                  
                  {showPurchasePaymentInfo && (
                    <div className="mb-2 text-sm">
                      <div className="font-bold mb-1">{t("paymentInfo")}:</div>
                      <div>{t("paymentMethod")}: {t("cash")}</div>
                      <div>{t("amountPaid")}: {formatCurrency(9000)}</div>
                      <div>{t("change")}: {formatCurrency(150)}</div>
                    </div>
                  )}
                  
                  {purchaseTemplateFooter && (
                    <div className="text-center text-sm mt-2">
                      {purchaseTemplateFooter}
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="receipt-preview" 
                  style={{ 
                    width: paperWidth, 
                    fontSize: fontSize,
                    fontFamily: 'monospace',
                    margin: '0 auto'
                  }}
                >
                  {showBusinessInfo && (
                    <div className="text-center mb-2">
                      <div className="font-bold">{businessName}</div>
                      <div>{businessAddress}</div>
                      <div>{businessPhone}</div>
                    </div>
                  )}
                  
                  {showTransactionDetails && (
                    <div className="mb-2">
                      <div className="border-t border-b py-1">
                        <div className="flex justify-between">
                          <span>{t("receipt")} #:</span>
                          <span>001</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("date")}:</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("cashier")}:</span>
                          <span>John Doe</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showItemDetails && (
                    <div className="mb-2">
                      <div className="border-t border-b py-1">
                        <div className="font-bold mb-1">{t("items")}</div>
                        <div className="flex justify-between text-sm">
                          <span>Product A</span>
                          <span>2 × {formatCurrency(1500)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Product B</span>
                          <span>1 × {formatCurrency(3000)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showTotals && (
                    <div className="mb-2">
                      <div className="border-t border-b py-1">
                        <div className="flex justify-between">
                          <span>{t("subtotal")}:</span>
                          <span>{formatCurrency(4500)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("tax")} (18%):</span>
                          <span>{formatCurrency(810)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>{t("total")}:</span>
                          <span>{formatCurrency(5310)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showPaymentInfo && (
                    <div className="mb-2 text-sm">
                      <div className="font-bold mb-1">{t("paymentInfo")}:</div>
                      <div>{t("paymentMethod")}: {t("cash")}</div>
                      <div>{t("amountPaid")}: {formatCurrency(6000)}</div>
                      <div>{t("change")}: {formatCurrency(690)}</div>
                    </div>
                  )}
                  
                  {templateFooter && (
                    <div className="text-center text-sm mt-2">
                      {templateFooter}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsPreviewOpen(false)}>{t("close")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};