"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Search, User, Mail, RefreshCw, Shield } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: "tourist" | "provider" | "admin"
  provider_type: string | null
  created_at: string
}

interface AdminUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminUsersDialog({ open, onOpenChange }: AdminUsersDialogProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          (user.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const getProviderTypeLabel = (type: string | null) => {
    if (!type) return null
    const labels: Record<string, string> = {
      hotel: "Hotel Owner",
      tour_guide: "Tour Guide",
      car_rental: "Car Rental",
      restaurant: "Restaurant",
      transport: "Transport Service",
    }
    return labels[type] || type
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>All Users</DialogTitle>
              <DialogDescription>View and manage all users in the system</DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="tourist">Tourist</SelectItem>
              <SelectItem value="provider">Provider</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No users found</div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.full_name || "No name provided"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-12">
                        <Badge
                          variant={user.role === "admin" ? "default" : "outline"}
                          className={
                            user.role === "admin"
                              ? "bg-gray-900"
                              : user.role === "provider"
                                ? "bg-blue-100 text-blue-900"
                                : "bg-gray-100 text-gray-900"
                          }
                        >
                          {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                          {user.role}
                        </Badge>
                        {user.provider_type && (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-900">
                            {getProviderTypeLabel(user.provider_type)}
                          </Badge>
                        )}
                        {user.phone && (
                          <span className="text-sm text-gray-600">Phone: {user.phone}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 ml-12">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

