import * as React from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { adminAPI } from '../../lib/api'
import { Save, Bell, Mail, Globe, FileText, Shield } from 'lucide-react'

export function AdminSettingsPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = React.useState(true)
  const [notifyOnShipmentReceived, setNotifyOnShipmentReceived] = React.useState(true)
  const [notifyOnShipmentDispatched, setNotifyOnShipmentDispatched] = React.useState(true)
  const [notifyOnStatusChange, setNotifyOnStatusChange] = React.useState(true)

  // System Settings
  const [defaultCurrency, setDefaultCurrency] = React.useState('USD')
  const [timezone, setTimezone] = React.useState('UTC')
  const [dateFormat, setDateFormat] = React.useState('YYYY-MM-DD')

  // Document Settings
  const [maxImageSizeMB, setMaxImageSizeMB] = React.useState(5)
  const [maxDocumentSizeMB, setMaxDocumentSizeMB] = React.useState(10)
  const [allowedImageTypes, setAllowedImageTypes] = React.useState('JPG, PNG, GIF, WEBP')
  const [allowedDocumentTypes, setAllowedDocumentTypes] = React.useState('PDF, JPG, PNG, GIF, WEBP')

  // Auto-notification Settings
  const [autoNotifyClientOnReceive, setAutoNotifyClientOnReceive] = React.useState(true)
  const [autoNotifyClientOnDispatch, setAutoNotifyClientOnDispatch] = React.useState(true)
  const [autoNotifyAdminOnShipment, setAutoNotifyAdminOnShipment] = React.useState(true)

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const settings = await adminAPI.getSettings()
        
        // Set notification settings
        if (settings.emailNotifications !== undefined) setEmailNotifications(settings.emailNotifications)
        if (settings.notifyOnShipmentReceived !== undefined) setNotifyOnShipmentReceived(settings.notifyOnShipmentReceived)
        if (settings.notifyOnShipmentDispatched !== undefined) setNotifyOnShipmentDispatched(settings.notifyOnShipmentDispatched)
        if (settings.notifyOnStatusChange !== undefined) setNotifyOnStatusChange(settings.notifyOnStatusChange)
        
        // Set system settings
        if (settings.defaultCurrency) setDefaultCurrency(settings.defaultCurrency)
        if (settings.timezone) setTimezone(settings.timezone)
        if (settings.dateFormat) setDateFormat(settings.dateFormat)
        
        // Set document settings
        if (settings.maxImageSizeMB) setMaxImageSizeMB(settings.maxImageSizeMB)
        if (settings.maxDocumentSizeMB) setMaxDocumentSizeMB(settings.maxDocumentSizeMB)
        if (settings.allowedImageTypes) setAllowedImageTypes(settings.allowedImageTypes)
        if (settings.allowedDocumentTypes) setAllowedDocumentTypes(settings.allowedDocumentTypes)
        
        // Set auto-notification settings
        if (settings.autoNotifyClientOnReceive !== undefined) setAutoNotifyClientOnReceive(settings.autoNotifyClientOnReceive)
        if (settings.autoNotifyClientOnDispatch !== undefined) setAutoNotifyClientOnDispatch(settings.autoNotifyClientOnDispatch)
        if (settings.autoNotifyAdminOnShipment !== undefined) setAutoNotifyAdminOnShipment(settings.autoNotifyAdminOnShipment)
      } catch (error: any) {
        console.error('Failed to load settings:', error)
        // Use defaults if loading fails
      } finally {
        setLoading(false)
      }
    }
    
    loadSettings()
  }, [])

  const handleSaveNotificationSettings = async () => {
    try {
      setSaving(true)
      await adminAPI.updateSettings({
        emailNotifications,
        notifyOnShipmentReceived,
        notifyOnShipmentDispatched,
        notifyOnStatusChange,
      })
      showToast('Notification settings saved successfully', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to save notification settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSystemSettings = async () => {
    try {
      setSaving(true)
      await adminAPI.updateSettings({
        defaultCurrency,
        timezone,
        dateFormat,
      })
      showToast('System settings saved successfully', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to save system settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDocumentSettings = async () => {
    try {
      setSaving(true)
      await adminAPI.updateSettings({
        maxImageSizeMB,
        maxDocumentSizeMB,
        allowedImageTypes,
        allowedDocumentTypes,
      })
      showToast('Document settings saved successfully', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to save document settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAutoNotificationSettings = async () => {
    try {
      setSaving(true)
      await adminAPI.updateSettings({
        autoNotifyClientOnReceive,
        autoNotifyClientOnDispatch,
        autoNotifyAdminOnShipment,
      })
      showToast('Auto-notification settings saved successfully', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to save auto-notification settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">System Settings</div>
        <div className="mt-1 text-sm text-slate-600">Configure system-wide settings that affect all users and roles.</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Notification Settings
            </CardTitle>
            <div className="text-xs text-slate-500">Configure how notifications are sent to users</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Email Notifications</div>
                  <div className="text-xs text-slate-600">Send email notifications for important events</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Notify on Shipment Received</div>
                  <div className="text-xs text-slate-600">Notify clients when warehouse receives their shipment</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnShipmentReceived}
                    onChange={(e) => setNotifyOnShipmentReceived(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Notify on Shipment Dispatched</div>
                  <div className="text-xs text-slate-600">Notify clients when shipment leaves warehouse</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnShipmentDispatched}
                    onChange={(e) => setNotifyOnShipmentDispatched(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Notify on Status Change</div>
                  <div className="text-xs text-slate-600">Notify users when shipment status changes</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnStatusChange}
                    onChange={(e) => setNotifyOnStatusChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <Button
                onClick={handleSaveNotificationSettings}
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              System Settings
            </CardTitle>
            <div className="text-xs text-slate-500">Configure system-wide defaults</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Default Currency</div>
                <Select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="UZS">UZS - Uzbekistani Som</option>
                </Select>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Timezone</div>
                <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="UTC">UTC - Coordinated Universal Time</option>
                  <option value="America/New_York">America/New_York - Eastern Time</option>
                  <option value="Europe/London">Europe/London - GMT</option>
                  <option value="Asia/Tashkent">Asia/Tashkent - Uzbekistan Time</option>
                </Select>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Date Format</div>
                <Select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2024-01-15)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (01/15/2024)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (15/01/2024)</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY (15-01-2024)</option>
                </Select>
              </div>

              <Button
                onClick={handleSaveSystemSettings}
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save System Settings'}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Document Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Document Settings
            </CardTitle>
            <div className="text-xs text-slate-500">Configure file upload limits and allowed types</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Max Image Size (MB)</div>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={maxImageSizeMB}
                  onChange={(e) => setMaxImageSizeMB(Number(e.target.value))}
                  placeholder="5"
                />
                <div className="text-xs text-slate-500 mt-1">Maximum size for product images and received product images</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Max Document Size (MB)</div>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={maxDocumentSizeMB}
                  onChange={(e) => setMaxDocumentSizeMB(Number(e.target.value))}
                  placeholder="10"
                />
                <div className="text-xs text-slate-500 mt-1">Maximum size for delivery notes and BL documents</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Allowed Image Types</div>
                <Input
                  value={allowedImageTypes}
                  onChange={(e) => setAllowedImageTypes(e.target.value)}
                  placeholder="JPG, PNG, GIF, WEBP"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Allowed Document Types</div>
                <Input
                  value={allowedDocumentTypes}
                  onChange={(e) => setAllowedDocumentTypes(e.target.value)}
                  placeholder="PDF, JPG, PNG, GIF, WEBP"
                />
              </div>

              <Button
                onClick={handleSaveDocumentSettings}
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Document Settings'}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Auto-Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Auto-Notification Settings
            </CardTitle>
            <div className="text-xs text-slate-500">Configure automatic notifications sent to users</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Auto-notify Client on Receive</div>
                  <div className="text-xs text-slate-600">Automatically notify client when warehouse receives shipment</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoNotifyClientOnReceive}
                    onChange={(e) => setAutoNotifyClientOnReceive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Auto-notify Client on Dispatch</div>
                  <div className="text-xs text-slate-600">Automatically notify client when shipment is dispatched</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoNotifyClientOnDispatch}
                    onChange={(e) => setAutoNotifyClientOnDispatch(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Auto-notify Admin on Shipment</div>
                  <div className="text-xs text-slate-600">Automatically notify admin on new shipments and updates</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoNotifyAdminOnShipment}
                    onChange={(e) => setAutoNotifyAdminOnShipment(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <Button
                onClick={handleSaveAutoNotificationSettings}
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Auto-Notification Settings'}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* System Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              System Information
            </CardTitle>
            <div className="text-xs text-slate-500">System details and version information</div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Application Version</div>
                <div className="mt-1 text-sm text-slate-900">1.0.0</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">API Version</div>
                <div className="mt-1 text-sm text-slate-900">v1</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Supported Roles</div>
                <div className="mt-1 text-sm text-slate-900">Client, Warehouse, Admin</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Database</div>
                <div className="mt-1 text-sm text-slate-900">MongoDB</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
