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
    paymentMethod: "all",
    dateRange: "all",
    amountRange: "all"
  });

  // Mock data - thay thế bằng API call thực tế
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
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

    // Payment method filter
    if (filters.paymentMethod !== "all") {
      filtered = filtered.filter(transaction => transaction.paymentMethod === filters.paymentMethod);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filters]);

  const handleExport = () => {
    // Export functionality
    console.log("Exporting transactions...");
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
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

              {/* Payment Method Filter */}
              <Select value={filters.paymentMethod} onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}>
                <SelectTrigger className="border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phương thức</SelectItem>
                  <SelectItem value="wallet">Ví điện tử</SelectItem>
                  <SelectItem value="e_wallet">ZaloPay/Momo</SelectItem>
                  <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                  <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger className="border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                  <SelectValue placeholder="Thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="week">7 ngày qua</SelectItem>
                  <SelectItem value="month">30 ngày qua</SelectItem>
                  <SelectItem value="quarter">3 tháng qua</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <TransactionsList
          transactions={filteredTransactions}
          loading={loading}
          onSelectTransaction={setSelectedTransaction}
        />

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