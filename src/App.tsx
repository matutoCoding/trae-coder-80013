import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import RentCalculator from "@/pages/RentCalculator";
import RentConfig from "@/pages/RentConfig";
import BillList from "@/pages/BillList";
import BillDetail from "@/pages/BillDetail";
import DepositApprovalList from "@/pages/DepositApprovalList";
import DepositApprovalDetail from "@/pages/DepositApprovalDetail";
import RefundList from "@/pages/RefundList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rent/calculator" element={<RentCalculator />} />
          <Route path="rent/config" element={<RentConfig />} />
          <Route path="bills" element={<BillList />} />
          <Route path="bills/:id" element={<BillDetail />} />
          <Route path="deposit" element={<DepositApprovalList />} />
          <Route path="deposit/:id" element={<DepositApprovalDetail />} />
          <Route path="refund" element={<RefundList />} />
        </Route>
      </Routes>
    </Router>
  );
}
