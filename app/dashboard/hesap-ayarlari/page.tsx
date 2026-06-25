import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordForm, EmailVerificationForm, LogoutAllButton, DeleteAccountForm } from "./form-client"

export default function HesapAyarlariPage() {
  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Hesap Ayarları" }]} />
      <div>
        <h1 className="text-3xl font-semibold">Hesap Ayarları</h1>
        <p className="mt-2 text-base text-muted-foreground">Şifre değiştirme, oturum yönetimi ve hesap silme işlemleri.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-xl">E-posta Doğrulama</CardTitle></CardHeader>
        <CardContent><EmailVerificationForm /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-xl">Şifre Değiştir</CardTitle></CardHeader>
        <CardContent><ChangePasswordForm /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-xl">Oturum Yönetimi</CardTitle></CardHeader>
        <CardContent><LogoutAllButton /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-xl text-destructive">Hesabı Sil</CardTitle></CardHeader>
        <CardContent><DeleteAccountForm /></CardContent>
      </Card>
    </section>
  )
}
