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

// Fulfillment status options — payment status is separate (set by Stripe)
const FULFILLMENT_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_COLORS = {
  paid: "green",
  unpaid: "red",
  no_payment_required: "gray",
};

const FULFILLMENT_COLORS = {
  pending: "yellow",
  shipped: "blue",
  delivered: "teal",
  cancelled: "red",
};

const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const OrdersPage = () => {
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

  useEffect(() => {
    dispatch(getOrders());
    dispatch(getDonations());
  }, [dispatch]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeDonations = Array.isArray(donations) ? donations : [];

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const res = await dispatch(updateOrderStatus(orderId, newStatus));
    if (res?.success) {
      toast.success("Order status updated!");
      dispatch(getOrders()); // refresh
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } else {
      toast.error(res?.message || "Failed to update status");
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

  const merchRows = safeOrders.map((order) => (
    <Table.Tr key={order?._id || Math.random()}>
      <Table.Td>
        <Text size="sm" color="white" className="alexandria-font">
          {order?.createdAt
            ? dayjs(order.createdAt).format("DD MMM YYYY")
            : "N/A"}
        </Text>
        <Text size="xs" color="dimmed" className="alexandria-font">
          {order?.createdAt ? dayjs(order.createdAt).format("HH:mm") : ""}
        </Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={0}>
          <Text size="sm" color="white" className="alexandria-font">
            {order?.customerName || "N/A"}
          </Text>
          <Text size="xs" color="dimmed" className="alexandria-font">
            {order?.customerEmail || "N/A"}
          </Text>
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
        {/* Payment Status — read-only, set by Stripe */}
        <Badge
          color={PAYMENT_STATUS_COLORS[order?.stripePaymentStatus] || "green"}
          variant="light"
          radius="xs"
          size="xs"
          className="alexandria-font"
        >
          {order?.stripePaymentStatus || "paid"}
        </Badge>
      </Table.Td>
      <Table.Td className="alexandria-font">
        {/* Fulfillment Status — editable by admin */}
        <Select
          size="xs"
          value={
            order?.status === "paid" ? "pending" : order?.status || "pending"
          }
          data={FULFILLMENT_OPTIONS}
          disabled={updatingId === order?._id}
          className="alexandria-font"
          onChange={(val) => handleStatusChange(order._id, val)}
          classNames={{
            input: "alexandria-font",
            dropdown: "alexandria-font",
            option: "alexandria-font",
          }}
          styles={{
            input: {
              backgroundColor: "#1A1A23",
              border: "1px solid #B5B387",
              color: "#F6F4D3",
              fontSize: 11,
            },
            dropdown: {
              backgroundColor: "#1A1A23",
              border: "1px solid #B5B387",
            },
            option: {
              color: "#F6F4D3",
              fontSize: 11,
            },
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

  const donationRows = safeDonations.map((donation) => (
    <Table.Tr key={donation?._id || Math.random()}>
      <Table.Td>
        <Text size="sm" color="white" className="alexandria-font">
          {donation?.createdAt
            ? dayjs(donation.createdAt).format("DD MMM YYYY")
            : "N/A"}
        </Text>
        <Text size="xs" color="dimmed" className="alexandria-font">
          {donation?.createdAt ? dayjs(donation.createdAt).format("HH:mm") : ""}
        </Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={0}>
          <Text size="sm" color="white" className="alexandria-font">
            {donation?.customerName || "Guest"}
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
        <Badge
          color="green"
          variant="filled"
          radius="xs"
          className="alexandria-font"
        >
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
        <h1 className="pixel-font text-[#F6F4D3] text-[24px] uppercase tracking-widest mb-2">
          SALES & DONATIONS
        </h1>
        <Text color="dimmed" size="sm" className="alexandria-font">
          Manage your merch orders and view support artist contributions.
        </Text>
      </Box>

      {/* Tabs */}
      <Box className="bg-[#2F2E24] border border-[#B5B387]/30 relative">
        <CornerAccents />
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
          p="md"
          styles={{
            tab: {
              color: "#F6F4D3 !important",
              backgroundColor: "transparent",
              transition: "all 0.2s ease",
              "&[data-active]": {
                backgroundColor: "#F6F4D3 !important",
                color: "#1A1A23 !important",
              },
              "&:hover:not([data-active])": {
                backgroundColor: "rgba(246, 244, 211, 0.1) !important",
              },
            },
            tabLabel: {
              fontWeight: 600,
              letterSpacing: "1px",
            },
          }}
        >
          <Tabs.List mb="md">
            <Tabs.Tab value="merch" className="alexandria-font">
              MERCH ORDERS
            </Tabs.Tab>
            <Tabs.Tab value="donations" className="alexandria-font">
              DONATIONS
            </Tabs.Tab>
          </Tabs.List>

          {/* Merch Orders */}
          <Tabs.Panel value="merch">
            {isLoadingOrders ? (
              <Center h={200}>
                <Loader color="#F6F4D3" />
              </Center>
            ) : (
              <ScrollArea>
                <Table className="alexandria-font" style={{ color: "white" }}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ color: "#F6F4D3" }}>DATE</Table.Th>
                      <Table.Th style={{ color: "#F6F4D3" }}>CUSTOMER</Table.Th>
                      <Table.Th style={{ color: "#F6F4D3" }}>ITEMS</Table.Th>
                      <Table.Th style={{ color: "#F6F4D3" }}>TOTAL</Table.Th>
                      <Table.Th style={{ color: "#F6F4D3" }}>PAYMENT</Table.Th>
                      <Table.Th style={{ color: "#F6F4D3" }}>
                        FULFILLMENT
                      </Table.Th>
                      <Table.Th style={{ color: "#F6F4D3" }}>VIEW</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{merchRows}</Table.Tbody>
                </Table>
                {safeOrders.length === 0 && (
                  <Text
                    ta="center"
                    py="xl"
                    color="dimmed"
                    className="pixel-font"
                    style={{ fontSize: 10 }}
                  >
                    No merch orders found.
                  </Text>
                )}
              </ScrollArea>
            )}
          </Tabs.Panel>

          {/* Donations */}
          <Tabs.Panel value="donations">
            {isLoadingDonations ? (
              <Center h={200}>
                <Loader color="#F6F4D3" />
              </Center>
            ) : (
              <ScrollArea>
                <Table className="alexandria-font" style={{ color: "white" }}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ color: "#F6F4D3" }}>DATE</Table.Th>
                      <Table.Th style={{ color: "#F6F4D3" }}>
                        ARTIST SUPPORTER
                      </Table.Th>
                      <Table.Th style={{ color: "#F6F4D3" }}>AMOUNT</Table.Th>
                      <Table.Th style={{ color: "#F6F4D3" }}>STATUS</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{donationRows}</Table.Tbody>
                </Table>
                {safeDonations.length === 0 && (
                  <Text
                    ta="center"
                    py="xl"
                    color="dimmed"
                    className="pixel-font"
                    style={{ fontSize: 10 }}
                  >
                    No donations found.
                  </Text>
                )}
              </ScrollArea>
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
          content: {
            backgroundColor: "#0D0D15",
            border: "2px solid #B5B387",
            borderRadius: 0,
            padding: 0,
          },
          overlay: { backgroundColor: "rgba(0,0,0,0.85)" },
          header: { display: "none" },
          body: { padding: 0 },
        }}
      >
        {selectedOrder && (
          <Box style={{ padding: "2rem" }}>
            {/* Modal Header */}
            <Text
              className="alexandria-font"
              ta="center"
              style={{
                color: "#F6F4D3",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "2px",
                marginBottom: 4,
              }}
            >
              Order Details
            </Text>
            <Text
              className="alexandria-font"
              ta="center"
              style={{ color: "#B5B387", fontSize: 11, marginBottom: 20 }}
            >
              #{selectedOrder._id?.slice(-8).toUpperCase()}
            </Text>

            <Divider color="#2b2f55" mb="lg" />

            {/* Customer Info */}
            <Text
              className="alexandria-font"
              style={{
                color: "#B5B387",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "1px",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              Customer Info
            </Text>
            <Box
              style={{
                backgroundColor: "#131319",
                border: "1px solid #2b2f55",
                padding: "10px 14px",
                marginBottom: 14,
              }}
            >
              <Text
                className="alexandria-font"
                style={{
                  color: "#F6F4D3",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                {selectedOrder.customerName || "N/A"}
              </Text>
              <Text
                className="alexandria-font"
                style={{ color: "#8b8fa8", fontSize: 12 }}
              >
                {selectedOrder.customerEmail || "N/A"}
              </Text>
            </Box>

            {/* Shipping Address */}
            <Text
              className="alexandria-font"
              style={{
                color: "#B5B387",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "1px",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              Shipping Address
            </Text>
            <Box
              style={{
                backgroundColor: "#131319",
                border: "1px solid #2b2f55",
                padding: "10px 14px",
                marginBottom: 14,
              }}
            >
              <Text
                className="alexandria-font"
                style={{ color: "#F6F4D3", fontSize: 12, lineHeight: 1.6 }}
              >
                {selectedOrder.shippingAddress || "N/A"}
              </Text>
            </Box>

            {/* Order Items */}
            <Text
              className="alexandria-font"
              style={{
                color: "#B5B387",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "1px",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              Order Items
            </Text>
            <Stack gap="xs" mb="md">
              {Array.isArray(selectedOrder.items) &&
                selectedOrder.items.map((item, idx) => (
                  <Box
                    key={idx}
                    style={{
                      backgroundColor: "#131319",
                      border: "1px solid #2b2f55",
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Group gap="sm">
                      {item.image && (
                        <Avatar src={item.image} size="sm" radius="xs" />
                      )}
                      <Text
                        className="alexandria-font"
                        style={{ color: "#F6F4D3", fontSize: 12 }}
                      >
                        {item.name} × {item.quantity || 1}
                      </Text>
                    </Group>
                    <Text
                      className="alexandria-font"
                      style={{
                        color: "#5EEAD4",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      €{(item.price * (item.quantity || 1)).toFixed(2)}
                    </Text>
                  </Box>
                ))}
              {/* Total */}
              <Box
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #2b2f55",
                  marginTop: 4,
                }}
              >
                <Text
                  className="alexandria-font"
                  style={{ color: "#F6F4D3", fontSize: 13, fontWeight: 700 }}
                >
                  Total
                </Text>
                <Text
                  className="alexandria-font"
                  style={{ color: "#F6F4D3", fontSize: 13, fontWeight: 700 }}
                >
                  €{selectedOrder.totalAmount?.toFixed(2)}
                </Text>
              </Box>
            </Stack>

            <Divider color="#2b2f55" mb="lg" />

            {/* Payment Status — read-only */}
            <Text
              className="alexandria-font"
              style={{
                color: "#B5B387",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "1px",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              Payment Status
            </Text>
            <Box style={{ marginBottom: 14 }}>
              <Badge
                color={
                  PAYMENT_STATUS_COLORS[selectedOrder.stripePaymentStatus] ||
                  "green"
                }
                variant="filled"
                radius="xs"
                size="md"
                className="alexandria-font"
              >
                {selectedOrder.stripePaymentStatus || "paid"}
              </Badge>
            </Box>

            {/* Fulfillment Status Changer */}
            <Text
              className="alexandria-font"
              style={{
                color: "#B5B387",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "1px",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              Fulfillment Status
            </Text>
            <Select
              value={
                selectedOrder.status === "paid"
                  ? "pending"
                  : selectedOrder.status || "pending"
              }
              data={FULFILLMENT_OPTIONS}
              disabled={updatingId === selectedOrder._id}
              onChange={(val) => handleStatusChange(selectedOrder._id, val)}
              classNames={{
                input: "alexandria-font",
                dropdown: "alexandria-font",
                option: "alexandria-font",
              }}
              styles={{
                input: {
                  backgroundColor: "#131319",
                  border: "1px solid #B5B387",
                  color: "#F6F4D3",
                  fontSize: 13,
                  height: 40,
                },
                dropdown: {
                  backgroundColor: "#131319",
                  border: "1px solid #B5B387",
                },
                option: {
                  color: "#F6F4D3",
                  fontSize: 13,
                },
              }}
            />

            {/* Date */}
            <Text
              className="alexandria-font"
              ta="center"
              style={{ color: "#8b8fa8", fontSize: 11, marginTop: 16 }}
            >
              Placed:{" "}
              {selectedOrder.createdAt
                ? dayjs(selectedOrder.createdAt).format("DD MMM YYYY · HH:mm")
                : "N/A"}
            </Text>

            {/* Close button */}
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "10px",
                backgroundColor: "#2F2E24",
                border: "1px solid #B5B387",
                color: "#F6F4D3",
                fontFamily: "Alexandria, sans-serif",
                fontSize: 13,
                letterSpacing: "1px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default OrdersPage;
