import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Text,
  Tabs,
  Table,
  Badge,
  Loader,
  Center,
  ScrollArea,
  Stack,
  Select,
  Modal,
  Divider,
  Group,
  Avatar,
} from "@mantine/core";
import {
  getOrders,
  getDonations,
  updateOrderStatus,
} from "../../store/actions/adminActions";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 10;

const FULFILLMENT_OPTIONS = [
  { value: "pending", labelKey: "orders.status.pending" },
  { value: "shipped", labelKey: "orders.status.shipped" },
  { value: "delivered", labelKey: "orders.status.delivered" },
  { value: "cancelled", labelKey: "orders.status.cancelled" },
];

const PAYMENT_STATUS_COLORS = {
  paid: "green",
  unpaid: "red",
  no_payment_required: "gray",
};

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B5B387" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PaginationBar = ({ page, total, onChange }) => {
  if (total <= 1) return null;

  const getPages = () => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
    if (page < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  const btnBase = {
    background: "transparent",
    border: "1px solid rgba(181,179,135,0.3)",
    color: "rgba(246,244,211,0.6)",
    padding: "6px 11px",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "Alexandria, sans-serif",
    minWidth: 32,
    lineHeight: 1,
  };

  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center", padding: "16px 0 4px" }}>
      <button
        className="alexandria-font"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{ ...btnBase, color: page === 1 ? "rgba(181,179,135,0.2)" : "#B5B387", cursor: page === 1 ? "not-allowed" : "pointer" }}
      >
        ‹
      </button>
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="alexandria-font" style={{ color: "rgba(181,179,135,0.4)", padding: "0 4px", fontSize: 12 }}>…</span>
        ) : (
          <button
            key={p}
            className="alexandria-font"
            onClick={() => onChange(p)}
            style={{
              ...btnBase,
              background: p === page ? "#B5B387" : "transparent",
              color: p === page ? "#1A1A23" : "rgba(246,244,211,0.6)",
              fontWeight: p === page ? 700 : 400,
              border: p === page ? "1px solid #B5B387" : "1px solid rgba(181,179,135,0.3)",
            }}
          >
            {p}
          </button>
        )
      )}
      <button
        className="alexandria-font"
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        style={{ ...btnBase, color: page === total ? "rgba(181,179,135,0.2)" : "#B5B387", cursor: page === total ? "not-allowed" : "pointer" }}
      >
        ›
      </button>
    </div>
  );
};

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1A1A23",
    border: "1px solid rgba(181,179,135,0.35)",
    padding: "0 10px",
    minWidth: 220,
  }}>
    <span style={{ display: "flex", alignItems: "center", flexShrink: 0, opacity: 0.6 }}>
      <SearchIcon />
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        background: "transparent",
        border: "none",
        color: "#F6F4D3",
        padding: "8px 0",
        fontSize: 12,
        fontFamily: "Alexandria, sans-serif",
        outline: "none",
        width: "100%",
        minWidth: 0,
      }}
    />
  </div>
);

const OrdersPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const adminState = useSelector((state) => state.admin);
  const {
    orders = [],
    donations = [],
    isLoadingOrders = false,
    isLoadingDonations = false,
  } = adminState || {};

  const [activeTab, setActiveTab] = useState("merch");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [merchSearch, setMerchSearch] = useState("");
  const [donationSearch, setDonationSearch] = useState("");
  const [merchPage, setMerchPage] = useState(1);
  const [donationPage, setDonationPage] = useState(1);

  useEffect(() => {
    dispatch(getOrders());
    dispatch(getDonations());
  }, [dispatch]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeDonations = Array.isArray(donations) ? donations : [];

  const filteredOrders = safeOrders.filter((o) => {
    const q = merchSearch.toLowerCase();
    return (
      o?.customerName?.toLowerCase().includes(q) ||
      o?.customerEmail?.toLowerCase().includes(q) ||
      o?._id?.toLowerCase().includes(q)
    );
  });

  const filteredDonations = safeDonations.filter((d) => {
    const q = donationSearch.toLowerCase();
    return (
      d?.customerName?.toLowerCase().includes(q) ||
      d?.customerEmail?.toLowerCase().includes(q) ||
      d?._id?.toLowerCase().includes(q)
    );
  });

  const totalMerchPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((merchPage - 1) * ITEMS_PER_PAGE, merchPage * ITEMS_PER_PAGE);

  const totalDonationPages = Math.max(1, Math.ceil(filteredDonations.length / ITEMS_PER_PAGE));
  const paginatedDonations = filteredDonations.slice((donationPage - 1) * ITEMS_PER_PAGE, donationPage * ITEMS_PER_PAGE);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const res = await dispatch(updateOrderStatus(orderId, newStatus));
    if (res?.success) {
      toast.success(t("orders.messages.update_success"));
      dispatch(getOrders());
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } else {
      toast.error(res?.message || t("orders.messages.update_failed"));
    }
    setUpdatingId(null);
  };

  const CornerAccents = () => (
    <>
      <div className="absolute top-0 left-0 w-2 h-2 bg-[#F6F4D3] z-20" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-[#F6F4D3] z-20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#F6F4D3] z-20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#F6F4D3] z-20" />
    </>
  );

  const merchRows = paginatedOrders.map((order) => (
    <Table.Tr key={order?._id || Math.random()}>
      <Table.Td>
        <Text size="sm" color="white" className="alexandria-font">
          {order?.createdAt ? dayjs(order.createdAt).format("DD MMM YYYY") : "N/A"}
        </Text>
        <Text size="xs" color="dimmed" className="alexandria-font">
          {order?.createdAt ? dayjs(order.createdAt).format("HH:mm") : ""}
        </Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={0}>
          <Text size="sm" color="white" className="alexandria-font">{order?.customerName || "N/A"}</Text>
          <Text size="xs" color="dimmed" className="alexandria-font">{order?.customerEmail || "N/A"}</Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="xs" color="dimmed" className="alexandria-font">
          {Array.isArray(order?.items) ? `${order.items.length} item(s)` : "—"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fw={700} color="#F6F4D3" className="alexandria-font">
          €{order?.totalAmount?.toFixed(2) || "0.00"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={PAYMENT_STATUS_COLORS[order?.stripePaymentStatus] || "green"}
          variant="light"
          radius="xs"
          size="xs"
          className="alexandria-font"
        >
          {order?.stripePaymentStatus
            ? t(`orders.status.${order.stripePaymentStatus.toLowerCase()}`)
            : t("orders.status.paid")}
        </Badge>
      </Table.Td>
      <Table.Td className="alexandria-font">
        <Select
          size="xs"
          value={order?.status === "paid" ? "pending" : order?.status || "pending"}
          data={FULFILLMENT_OPTIONS.map((opt) => ({ ...opt, label: t(opt.labelKey) }))}
          disabled={updatingId === order?._id}
          className="alexandria-font"
          onChange={(val) => handleStatusChange(order._id, val)}
          classNames={{ input: "alexandria-font", dropdown: "alexandria-font", option: "alexandria-font" }}
          styles={{
            input: { backgroundColor: "#1A1A23", border: "1px solid #B5B387", color: "#F6F4D3", fontSize: 11 },
            dropdown: { backgroundColor: "#1A1A23", border: "1px solid #B5B387" },
            option: { color: "#F6F4D3", fontSize: 11 },
          }}
        />
      </Table.Td>
      <Table.Td>
        <button
          onClick={() => setSelectedOrder(order)}
          title="View Details"
          style={{
            background: "none",
            border: "1px solid #B5B387",
            color: "#F6F4D3",
            padding: "6px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <EyeIcon />
        </button>
      </Table.Td>
    </Table.Tr>
  ));

  const donationRows = paginatedDonations.map((donation) => (
    <Table.Tr key={donation?._id || Math.random()}>
      <Table.Td>
        <Text size="sm" color="white" className="alexandria-font">
          {donation?.createdAt ? dayjs(donation.createdAt).format("DD MMM YYYY") : "N/A"}
        </Text>
        <Text size="xs" color="dimmed" className="alexandria-font">
          {donation?.createdAt ? dayjs(donation.createdAt).format("HH:mm") : ""}
        </Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={0}>
          <Text size="sm" color="white" className="alexandria-font">
            {donation?.customerName || t("orders.customer.guest")}
          </Text>
          <Text size="xs" color="dimmed" className="alexandria-font">
            {donation?.customerEmail || "N/A"}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text fw={700} color="#5EEAD4" className="alexandria-font">
          €{donation?.amount?.toFixed(2) || "0.00"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color="green" variant="filled" radius="xs" className="alexandria-font">
          {(donation?.stripeSessionStatus || "paid").toUpperCase()}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box className="bg-[#1A1A23] min-h-screen" style={{ position: "relative" }}>
      {/* Header */}
      <Box className="bg-[#2F2E24] border border-[#B5B387]/30 p-6 relative overflow-hidden mb-6">
        <CornerAccents />
        <h1 className="text-[#F6F4D3] alexandria-font text-2xl mb-4 tracking-widest">
          {t("orders.title")}
        </h1>
        <Text color="dimmed" size="sm" className="alexandria-font">
          {t("orders.subtitle")}
        </Text>
      </Box>

      {/* Tabs */}
      <Box className="bg-[#2F2E24] border border-[#B5B387]/30 relative">
        <CornerAccents />
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="unstyled"
          styles={{
            list: {
              display: "flex",
              gap: "0",
              borderBottom: "none",
              marginBottom: "0",
            },
            tab: {
              color: "rgba(246,244,211,0.45)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "2px solid transparent",
              borderRadius: "0",
              padding: "13px 28px",
              cursor: "pointer",
              fontFamily: "Alexandria, sans-serif",
              fontWeight: 600,
              letterSpacing: "1.5px",
              fontSize: "11px",
              textTransform: "uppercase",
              transition: "color 0.2s, border-color 0.2s",
            },
          }}
        >
          {/* Tab bar row: tabs left | search + count right */}
          <div style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(181,179,135,0.25)",
          }}>
            <Tabs.List>
              <Tabs.Tab
                value="merch"
                className="alexandria-font"
                style={activeTab === "merch" ? {
                  color: "#F6F4D3",
                  borderBottom: "2px solid #B5B387",
                  backgroundColor: "rgba(181,179,135,0.06)",
                } : {}}
              >
                {t("orders.tabs.merch")}
              </Tabs.Tab>
              <Tabs.Tab
                value="donations"
                className="alexandria-font"
                style={activeTab === "donations" ? {
                  color: "#F6F4D3",
                  borderBottom: "2px solid #B5B387",
                  backgroundColor: "rgba(181,179,135,0.06)",
                } : {}}
              >
                {t("orders.tabs.donations")}
              </Tabs.Tab>
            </Tabs.List>

            {/* Search + count — always visible, switches context with active tab */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}>
              <SearchBar
                value={activeTab === "merch" ? merchSearch : donationSearch}
                onChange={(e) => {
                  if (activeTab === "merch") { setMerchSearch(e.target.value); setMerchPage(1); }
                  else { setDonationSearch(e.target.value); setDonationPage(1); }
                }}
                placeholder="Search by name or email…"
              />
              <Text size="xs" color="dimmed" className="alexandria-font" style={{ whiteSpace: "nowrap", minWidth: 80, textAlign: "right" }}>
                {activeTab === "merch"
                  ? `${filteredOrders.length} ${filteredOrders.length === 1 ? "order" : "orders"}`
                  : `${filteredDonations.length} ${filteredDonations.length === 1 ? "donation" : "donations"}`}
              </Text>
            </div>
          </div>

          {/* Merch Orders */}
          <Tabs.Panel value="merch" p="md">
            {isLoadingOrders ? (
              <Center h={200}><Loader color="#F6F4D3" /></Center>
            ) : (
              <>
                <ScrollArea>
                  <Table className="alexandria-font" style={{ color: "white" }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.merch_table.date")}</Table.Th>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.merch_table.customer")}</Table.Th>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.merch_table.items")}</Table.Th>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.merch_table.amount")}</Table.Th>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.merch_table.payment")}</Table.Th>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.merch_table.fulfillment")}</Table.Th>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.merch_table.actions")}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{merchRows}</Table.Tbody>
                  </Table>
                  {filteredOrders.length === 0 && (
                    <Text ta="center" py="xl" color="dimmed" className="pixel-font" style={{ fontSize: 10 }}>
                      {merchSearch ? "No orders match your search." : t("orders.messages.no_orders")}
                    </Text>
                  )}
                </ScrollArea>

                <PaginationBar page={merchPage} total={totalMerchPages} onChange={setMerchPage} />
                {totalMerchPages > 1 && (
                  <Text ta="center" size="xs" color="dimmed" className="alexandria-font" style={{ paddingBottom: 8 }}>
                    Page {merchPage} of {totalMerchPages}
                  </Text>
                )}
              </>
            )}
          </Tabs.Panel>

          {/* Donations */}
          <Tabs.Panel value="donations" p="md">
            {isLoadingDonations ? (
              <Center h={200}><Loader color="#F6F4D3" /></Center>
            ) : (
              <>
                <ScrollArea>
                  <Table className="alexandria-font" style={{ color: "white" }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.donations_table.date")}</Table.Th>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.donations_table.donor")}</Table.Th>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.donations_table.amount")}</Table.Th>
                        <Table.Th style={{ color: "#F6F4D3" }}>{t("orders.donations_table.status")}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{donationRows}</Table.Tbody>
                  </Table>
                  {filteredDonations.length === 0 && (
                    <Text ta="center" py="xl" color="dimmed" className="pixel-font" style={{ fontSize: 10 }}>
                      {donationSearch ? "No donations match your search." : t("orders.messages.no_donations")}
                    </Text>
                  )}
                </ScrollArea>

                <PaginationBar   page={donationPage} total={totalDonationPages} onChange={setDonationPage} />
                {totalDonationPages > 1 && (
                  <Text ta="center" size="xs" color="dimmed" className="alexandria-font" style={{ paddingBottom: 8 }}>
                    Page {donationPage} of {totalDonationPages}
                  </Text>
                )}
              </>
            )}
          </Tabs.Panel>
        </Tabs>
      </Box>

      {/* Order Details Modal */}
      <Modal
        opened={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={null}
        centered
        size="md"
        styles={{
          content: { backgroundColor: "#0D0D15", border: "2px solid #B5B387", borderRadius: 0, padding: 0 },
          overlay: { backgroundColor: "rgba(0,0,0,0.85)" },
          header: { display: "none" },
          body: { padding: 0 },
        }}
      >
        {selectedOrder && (
          <Box style={{ padding: "2rem" }}>
            <Text className="alexandria-font" ta="center" style={{ color: "#F6F4D3", fontSize: 16, fontWeight: 700, letterSpacing: "2px", marginBottom: 4 }}>
              {t("orders.details.title")}
            </Text>
            <Text className="alexandria-font" ta="center" style={{ color: "#B5B387", fontSize: 11, marginBottom: 20 }}>
              #{selectedOrder._id?.slice(-8).toUpperCase()}
            </Text>

            <Divider color="#2b2f55" mb="lg" />

            <Text className="alexandria-font" style={{ color: "#B5B387", fontSize: 10, fontWeight: 600, letterSpacing: "1px", marginBottom: 6, textTransform: "uppercase" }}>
              {t("orders.details.customer_info")}
            </Text>
            <Box style={{ backgroundColor: "#131319", border: "1px solid #2b2f55", padding: "10px 14px", marginBottom: 14 }}>
              <Text className="alexandria-font" style={{ color: "#F6F4D3", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                {selectedOrder.customerName || "N/A"}
              </Text>
              <Text className="alexandria-font" style={{ color: "#8b8fa8", fontSize: 12 }}>
                {selectedOrder.customerEmail || "N/A"}
              </Text>
            </Box>

            <Text className="alexandria-font" style={{ color: "#B5B387", fontSize: 10, fontWeight: 600, letterSpacing: "1px", marginBottom: 6, textTransform: "uppercase" }}>
              {t("orders.details.shipping_address")}
            </Text>
            <Box style={{ backgroundColor: "#131319", border: "1px solid #2b2f55", padding: "10px 14px", marginBottom: 14 }}>
              <Text className="alexandria-font" style={{ color: "#F6F4D3", fontSize: 12, lineHeight: 1.6 }}>
                {selectedOrder.shippingAddress || "N/A"}
              </Text>
            </Box>

            <Text className="alexandria-font" style={{ color: "#B5B387", fontSize: 10, fontWeight: 600, letterSpacing: "1px", marginBottom: 6, textTransform: "uppercase" }}>
              {t("orders.details.order_items")}
            </Text>
            <Stack gap="xs" mb="md">
              {Array.isArray(selectedOrder.items) &&
                selectedOrder.items.map((item, idx) => (
                  <Box key={idx} style={{ backgroundColor: "#131319", border: "1px solid #2b2f55", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Group gap="sm">
                      {item.image && <Avatar src={item.image} size="sm" radius="xs" />}
                      <Text className="alexandria-font" style={{ color: "#F6F4D3", fontSize: 12 }}>
                        {item.name} × {item.quantity || 1}
                      </Text>
                    </Group>
                    <Text className="alexandria-font" style={{ color: "#5EEAD4", fontSize: 12, fontWeight: 600 }}>
                      €{(item.price * (item.quantity || 1)).toFixed(2)}
                    </Text>
                  </Box>
                ))}
              <Box style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #2b2f55", marginTop: 4 }}>
                <Text className="alexandria-font" style={{ color: "#F6F4D3", fontSize: 13, fontWeight: 700 }}>{t("orders.details.total")}</Text>
                <Text className="alexandria-font" style={{ color: "#F6F4D3", fontSize: 13, fontWeight: 700 }}>€{selectedOrder.totalAmount?.toFixed(2)}</Text>
              </Box>
            </Stack>

            <Divider color="#2b2f55" mb="lg" />

            <Text className="alexandria-font" style={{ color: "#B5B387", fontSize: 10, fontWeight: 600, letterSpacing: "1px", marginBottom: 6, textTransform: "uppercase" }}>
              {t("orders.details.payment_status")}
            </Text>
            <Box style={{ marginBottom: 14 }}>
              <Badge color={PAYMENT_STATUS_COLORS[selectedOrder.stripePaymentStatus] || "green"} variant="filled" radius="xs" size="md" className="alexandria-font">
                {selectedOrder.stripePaymentStatus || "paid"}
              </Badge>
            </Box>

            <Text className="alexandria-font" style={{ color: "#B5B387", fontSize: 10, fontWeight: 600, letterSpacing: "1px", marginBottom: 6, textTransform: "uppercase" }}>
              {t("orders.details.fulfillment_status")}
            </Text>
            <Select
              value={selectedOrder.status === "paid" ? "pending" : selectedOrder.status || "pending"}
              data={FULFILLMENT_OPTIONS}
              disabled={updatingId === selectedOrder._id}
              onChange={(val) => handleStatusChange(selectedOrder._id, val)}
              classNames={{ input: "alexandria-font", dropdown: "alexandria-font", option: "alexandria-font" }}
              styles={{
                input: { backgroundColor: "#131319", border: "1px solid #B5B387", color: "#F6F4D3", fontSize: 13, height: 40 },
                dropdown: { backgroundColor: "#131319", border: "1px solid #B5B387" },
                option: { color: "#F6F4D3", fontSize: 13 },
              }}
            />

            <Text className="alexandria-font" ta="center" style={{ color: "#8b8fa8", fontSize: 11, marginTop: 16 }}>
              {t("orders.details.placed", { date: dayjs(selectedOrder.createdAt).format("DD MMM YYYY · HH:mm") })}
            </Text>

            <button
              onClick={() => setSelectedOrder(null)}
              style={{ marginTop: 16, width: "100%", padding: "10px", backgroundColor: "#2F2E24", border: "1px solid #B5B387", color: "#F6F4D3", fontFamily: "Alexandria, sans-serif", fontSize: 13, letterSpacing: "1px", cursor: "pointer" }}
            >
              {t("orders.details.close")}
            </button>
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default OrdersPage;
