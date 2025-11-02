import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FiSearch,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";

import type { Transaction } from "@/types/transactionType";
import { TransactionDetails } from "./components/TransactionDetails";
import { TransactionsList } from "./components/TransactionsList";
import { userServices } from "@/services/userServices";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    amountRange: "all"
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Mock data - thay thế bằng API call thực tế
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        // Sync return status first (no need to wait for response)
        userServices.syncReturnStatus().catch(err => console.error('Sync error:', err));
        
        const data = await userServices.fetchTransactions();
        setTransactions(data.transactions);
        setFilteredTransactions(data.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction._id.includes(searchTerm)
      );
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    // NOTE: paymentMethod filter removed per new UX

    // Always sort newest first
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filters]);

  // Pagination: compute displayed slice
  const totalItems = filteredTransactions.length;
  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  const displayedTransactions = filteredTransactions.slice(startIdx, endIdx);

  const handleExport = () => {
    // Export functionality
    console.log("Exporting transactions...");
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Sync return status first (no need to wait for response)
      userServices.syncReturnStatus().catch(err => console.error('Sync error:', err));
      
      const data = await userServices.fetchTransactions();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý giao dịch
            </h1>
            <p className="text-gray-600 mt-1">
              Theo dõi và quản lý mọi giao dịch tài chính trong hệ thống
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-gray-200 hover:bg-gray-50"
              onClick={handleExport}
            >
              <FiDownload className="w-4 h-4" />
              Xuất dữ liệu
            </Button>

            <Button
              size="sm"
              className="gap-2 bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
              onClick={handleRefresh}
            >
              <FiRefreshCw className="w-4 h-4" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <Card className="border border-gray-200 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg text-gray-900">Bộ lọc và tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm giao dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              {/* Type Filter */}
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger className="border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                  <SelectValue placeholder="Loại giao dịch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="deposit">Nạp tiền</SelectItem>
                  <SelectItem value="withdrawal">Rút tiền</SelectItem>
                  <SelectItem value="payment">Thanh toán</SelectItem>
                  <SelectItem value="refund">Hoàn tiền</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="pending">Đang xử lý</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              {/* (Payment method filter removed — sorting handled newest-first) */}

              {/* Date range filter removed per request */}
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <TransactionsList
          transactions={displayedTransactions}
          loading={loading}
          onSelectTransaction={setSelectedTransaction}
        />

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {Math.min(startIdx + 1, totalItems || 0)} - {Math.min(endIdx, totalItems || 0)} trên {totalItems}
          </div>

          <div className="flex items-center gap-3">
            <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-28 border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="25">25 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>
                Trước
              </Button>

              <div className="px-3 py-1 border rounded text-sm text-gray-700">
                {page} / {Math.max(1, Math.ceil((totalItems || 0) / limit))}
              </div>

              <Button size="sm" variant="outline" disabled={page >= Math.max(1, Math.ceil((totalItems || 0) / limit))} onClick={() => setPage(Math.min(Math.max(1, Math.ceil((totalItems || 0) / limit)), page + 1))}>
                Sau
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <TransactionDetails
            transaction={selectedTransaction}
            isOpen={!!selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </div>
  );
}