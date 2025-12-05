import { getMenuItems, getNavigationSettings } from "@/app/actions/menu"
import { MenuNavigationManager } from "@/components/admin/menu-navigation-manager"

export default async function MenuNavigationPage() {
  const [menuItems, navSettings] = await Promise.all([getMenuItems(), getNavigationSettings()])

  return (
    <div className="p-6">
      <MenuNavigationManager initialItems={menuItems} initialSettings={navSettings} />
    </div>
  )
}
