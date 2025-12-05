"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { updateBackupSchedule } from "@/app/actions/backup-settings"
import { toast } from "sonner"
import { Clock, Calendar } from "lucide-react"

interface BackupScheduleProps {
  initialSettings?: {
    frequency: "daily" | "weekly" | "monthly"
    enabled: boolean
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
  }
}

export function BackupScheduleSettings({ initialSettings }: BackupScheduleProps) {
  const [enabled, setEnabled] = useState(initialSettings?.enabled ?? true)
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(initialSettings?.frequency ?? "daily")
  const [time, setTime] = useState(initialSettings?.time ?? "00:00")
  const [dayOfWeek, setDayOfWeek] = useState(initialSettings?.dayOfWeek ?? 0)
  const [dayOfMonth, setDayOfMonth] = useState(initialSettings?.dayOfMonth ?? 1)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateBackupSchedule({
        enabled,
        frequency,
        time,
        dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
        dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
      })
      toast.success("Backup schedule updated successfully")
    } catch (error) {
      toast.error("Failed to update backup schedule")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Backup Schedule Settings
        </CardTitle>
        <CardDescription>
          Configure automated backup frequency and timing. All times are in UTC timezone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="backup-enabled">Enable Automated Backups</Label>
            <p className="text-sm text-muted-foreground">Run backups on a schedule</p>
          </div>
          <Switch id="backup-enabled" checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <div className="space-y-2">
              <Label>Backup Frequency</Label>
              <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Backup Time (UTC)</Label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Current selection: {time} UTC (approximately{" "}
                {new Date(`2000-01-01T${time}:00Z`).toLocaleTimeString("en-US", {
                  timeZone: "America/New_York",
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                EST)
              </p>
            </div>

            {frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {frequency === "monthly" && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Select value={dayOfMonth.toString()} onValueChange={(value) => setDayOfMonth(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Maximum day 28 to ensure it exists in all months</p>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Schedule"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
