import { Mail, Store } from "lucide-react"
import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { ShopNameForm, DirectEmailSection, WarehouseSection } from "./form-client"

type KnownSender = { id: string; email: string; label?: string; is_active: boolean; can_read?: boolean }
type Warehouse = { id: string; name: string; is_active: boolean; location_type?: string }

export default async function AyarlarPage() {
  const supabase = await createClient()

  const [
    { data: linkedEmailData },
    { data: warehouseData },
    { data: shopData },
  ] = await Promise.all([
    supabase.from("linked_emails").select("id, email, label, is_active, can_read").order("created_at", { ascending: false }),
    supabase.from("warehouses").select("id, name, is_active, location_type").order("created_at", { ascending: false }),
    supabase.from("shop_settings").select("shop_name, forwarding_address").limit(1).maybeSingle(),
  ])

  const knownSenders = (linkedEmailData ?? []) as KnownSender[]
  const warehouses = ((warehouseData ?? []) as Warehouse[]).map(w => ({
    id: w.id,
    name: w.name,
    is_active: w.is_active,
    location_type: w.location_type ?? "depo",
  }))
  const shopName = (shopData?.shop_name as string | undefined) ?? "Dükkanım"
  const forwardingAddress = shopData?.forwarding_address as string | undefined

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Ayarlar" }]} />
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Ayarlar</h1>
        <p className="mt-2 text-base text-muted-foreground">Dükkan bilgilerini, e-posta okuma ayarlarını ve depoları buradan yönet.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Dükkan Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <ShopNameForm defaultValue={shopName} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mail className="size-5" />
            E-posta ile Sipariş & Fatura Alma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DirectEmailSection senders={knownSenders} forwardingAddress={forwardingAddress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Store className="size-5" />
            Depo & Raf Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WarehouseSection warehouses={warehouses} />
        </CardContent>
      </Card>
    </section>
  )
}
