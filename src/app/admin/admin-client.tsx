"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import {
  Users,
  Crown,
  Search,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
  Ban,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserPlus,
} from "lucide-react"

interface User {
  id: string
  email: string | null
  name: string | null
  image: string | null
  subscriptionStatus: string
  subscriptionStart: string | null
  subscriptionEnd: string | null
  role: string
  isBlocked: boolean
  createdAt: string
  _count?: {
    savedCities: number
  }
}

interface Stats {
  total: number
  premium: number
  free: number
  blocked: number
  newThisMonth: number
}

export function AdminDashboard() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setUsers(data.users || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [page, search, toast])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleUpdateUser = async (userId: string, updates: Record<string, unknown>) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
          variant: "success",
        })
        fetchUsers()
        fetchStats()
      } else {
        throw new Error("Failed to update user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
      setSelectedUser(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
          variant: "success",
        })
        fetchUsers()
        fetchStats()
      } else {
        throw new Error("Failed to delete user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and subscriptions</p>
        </div>
        <Button variant="outline" onClick={() => { fetchUsers(); fetchStats(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <Crown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premium}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Free Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.free}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
              <Ban className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.blocked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage all registered users</CardDescription>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Saved Cities</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.image || ""} />
                              <AvatarFallback>
                                {user.name?.[0] || user.email?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name || "No name"}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user.subscriptionStatus === "PREMIUM" ? (
                              <>
                                <Badge variant="premium">
                                  <Crown className="mr-1 h-3 w-3" />
                                  Premium
                                </Badge>
                                {user.subscriptionEnd && (
                                  <span className="text-xs text-muted-foreground">
                                    до {formatDate(user.subscriptionEnd)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <Badge variant="secondary">Free</Badge>
                            )}
                            {user.isBlocked && (
                              <Badge variant="destructive">Blocked</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user._count?.savedCities || 0}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateUser(user.id, {
                                    subscriptionStatus:
                                      user.subscriptionStatus === "PREMIUM" ? "FREE" : "PREMIUM",
                                  })
                                }
                              >
                                {user.subscriptionStatus === "PREMIUM" ? (
                                  <>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Remove Premium
                                  </>
                                ) : (
                                  <>
                                    <Crown className="mr-2 h-4 w-4" />
                                    Grant Premium
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateUser(user.id, { isBlocked: !user.isBlocked })
                                }
                              >
                                {user.isBlocked ? (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Unblock User
                                  </>
                                ) : (
                                  <>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Block User
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateUser(user.id, {
                                    role: user.role === "ADMIN" ? "USER" : "ADMIN",
                                  })
                                }
                              >
                                {user.role === "ADMIN" ? (
                                  <>
                                    <Users className="mr-2 h-4 w-4" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
