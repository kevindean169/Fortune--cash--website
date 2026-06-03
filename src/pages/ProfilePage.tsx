import { useState } from 'react'
import { User, Lock, Mail, Phone, MapPin, Save, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    memberSince: '2023-06-15',
  })

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const [updateMessage, setUpdateMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = () => {
    setUpdateMessage('Profile updated successfully!')
    setTimeout(() => setUpdateMessage(''), 3000)
  }

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      setPasswordMessage('Passwords do not match!')
      return
    }
    if (passwordData.new.length < 8) {
      setPasswordMessage('Password must be at least 8 characters!')
      return
    }
    setPasswordMessage('Password changed successfully!')
    setPasswordData({ current: '', new: '', confirm: '' })
    setTimeout(() => setPasswordMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
            <User className="w-10 h-10 text-primary" />
            My Profile
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {updateMessage && (
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-500">{updateMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      className="bg-muted border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="bg-muted border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="bg-muted border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="bg-muted border-border"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    Member since: {new Date(profileData.memberSince).toLocaleDateString()}
                  </p>
                  <Button
                    onClick={handleUpdateProfile}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Change your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {passwordMessage && (
                  <Alert className={passwordMessage.includes('successfully') ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}>
                    <Check className={`h-4 w-4 ${passwordMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`} />
                    <AlertDescription className={passwordMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}>{passwordMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Current Password
                    </Label>
                    <Input
                      id="current"
                      name="current"
                      type="password"
                      value={passwordData.current}
                      onChange={handlePasswordChange}
                      className="bg-muted border-border"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      New Password
                    </Label>
                    <Input
                      id="new"
                      name="new"
                      type="password"
                      value={passwordData.new}
                      onChange={handlePasswordChange}
                      className="bg-muted border-border"
                      placeholder="Enter new password"
                    />
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm"
                      name="confirm"
                      type="password"
                      value={passwordData.confirm}
                      onChange={handlePasswordChange}
                      className="bg-muted border-border"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
