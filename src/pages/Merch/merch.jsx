import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Image,
  Flex,
  ActionIcon,
  Menu,
  Divider,
  Modal,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import { useDispatch, useSelector } from "react-redux";
import { getMerchs } from "../../store/actions/adminActions";
import { logoutAction } from "../../store/actions/authActions";
import { cartIcon } from "../../customIcons";
import { FaUserCircle, FaSignOutAlt, FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Merch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { merchs, isLoadingMerchs } = useSelector((state) => state.admin);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getMerchs());
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== id));
  };

  const handleLogout = async () => {
    const res = await dispatch(logoutAction());
    if (res) {
      navigate("/admin/login");
    }
  };

  return (
    <>
      <UserHeader
        title={t('merch_user.title')}
        suffix={
          <Flex gap="md" align="center">
            {isAuthenticated && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="transparent" size="xl" title={t('merch_user.account')}>
                    <FaUserCircle size={32} color="#F6F4D3" />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown
                  bg="#1a1b1e"
                  style={{ border: "1px solid #C1BE91" }}
                >
                  <Menu.Label color="#C1BE91">{t('merch_user.account')}</Menu.Label>
                  <Menu.Item disabled color="#fff">
                    {user?.email || "User"}
                  </Menu.Item>
                  <Divider my="xs" color="#333" />
                  <Menu.Item
                    leftSection={<FaSignOutAlt size={14} />}
                    color="red"
                    onClick={handleLogout}
                  >
                    {t('merch_user.logout')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
            <Box className="cursor-pointer flex items-center" onClick={() => setIsModalOpen(true)}>
              <div className="relative">
                {cartIcon()}
                {cartItems.length > 0 && (
                  <h1 className="bg-red-600 absolute -top-2 -right-3 text-white text-xs md:text-sm px-1.5 py-0.5 rounded-full border border-white font-bold z-10">
                    {cartItems.length}
                  </h1>
                )}
              </div>
            </Box>
          </Flex>
        }
      />

      <Box
        style={{
          height: "90%",
          display: "flex",
          justifyContent: "center",
          zIndex: 5,
          marginTop: "4rem",
          position: "relative",
          paddingTop: "15vh", // Space for header
          paddingBottom: "5vh",
        }}
      >
        <Box
          className="custom-scrollbar w-full"
          style={{
            maxWidth: "1200px",
            height: "100%",
            overflowY: "auto",
            padding: "0 2rem",
          }}
        >
          {isLoadingMerchs ? (
            <Flex
              justify="center"
              align="center"
              style={{ minHeight: "200px" }}
            >
              <Text color="#F6F4D3" className="vision-font">
                {t('merch_user.loading')}
              </Text>
            </Flex>
          ) : merchs.length > 0 ? (
            <Flex direction="column" gap={80} align="center">
              {merchs.map((item) => (
                <Flex
                  key={item._id}
                  direction="column"
                  align="center"
                  justify="center"
                  className="w-full"
                >
                  <Box
                    style={{
                      cursor: "pointer",
                      transition: "transform 1s ease",
                    }}
                    className="hover:scale-105  "
                    onClick={() => navigate("/buyshirt", { state: { item } })}
                  >
                    <Image
                      src={item.prod_image || item.image}
                      alt={item.name}
                      style={{
                        filter:
                          "brightness(1.1) drop-shadow(0 15px 30px rgba(0,0,0,0.5))",
                        objectFit: "contain",
                        maxHeight: "250px",
                      }}
                      className="w-[200px] md:w-[250px] lg:w-[320px] xl:w-[400px]"
                    />
                  </Box>

                  <Box className="flex flex-col items-center gap-4 mt-6">
                    <Text
                      style={{
                        color: "#F6F4D3",
                        letterSpacing: "4px",
                        textAlign: "center",
                        fontWeight: 900,
                      }}
                      className="text-2xl vision-font lg:text-3xl"
                    >
                      {item.name.toUpperCase()}
                    </Text>

                    <Button
                      className="p-2 hover:scale-110 transition-all duration-300 vision-font !text-lg"
                      onClick={() => navigate("/buyshirt", { state: { item } })}
                      bg={"#000"}
                      c={"#FFF"}
                      style={{
                        height: "auto",
                        border: "2px solid #F6F4D3",
                        borderRadius: "10px",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                      }}
                    >
                      {t('merch_user.buy', { price: item.price })}
                    </Button>
                  </Box>
                </Flex>
              ))}
            </Flex>
          ) : (
            <Flex
              justify="center"
              align="center"
              style={{ minHeight: "200px" }}
            >
              <Text color="#F6F4D3" className="vision-font">
                {t('merch_user.no_items')}
              </Text>
            </Flex>
          )}
        </Box>
      </Box>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <Text className="vision-font" size="xl" weight={900} color="#F6F4D3" style={{ letterSpacing: '2px' }}>
            {t('merch_user.cart.title')}
          </Text>
        }
        styles={{
          content: { backgroundColor: "#1a1b1e", border: "1px solid #333" },
          header: { backgroundColor: "#1a1b1e", borderBottom: "1px solid #333" },
          close: { color: "#F6F4D3", "&:hover": { backgroundColor: "#333" } },
        }}
        size="lg"
        centered
      >
        <Box className="flex flex-col gap-4" mt="md">
          {cartItems.length === 0 ? (
            <Text color="dimmed" align="center" className="vision-font py-8">
              {t('merch_user.cart.empty')}
            </Text>
          ) : (
            <>
              <Box className="flex flex-col gap-4 custom-scrollbar" style={{ maxHeight: "45vh", overflowY: "auto", paddingRight: "8px" }}>
                {cartItems.map((cartItem) => (
                <Flex
                  key={cartItem.cartItemId}
                  direction="column"
                  align="center"
                  p="md"
                  gap="xs"
                  style={{
                    backgroundColor: "#25262b",
                    borderRadius: "12px",
                    border: "1px solid #333",
                  }}
                >
                  <Box style={{ width: "120px", height: "120px", flexShrink: 0 }}>
                    <Image
                      src={cartItem.prod_image || cartItem.image}
                      radius="md"
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain", 
                        backgroundColor: "rgba(255,255,255,0.05)", 
                        padding: "8px" 
                      }}
                    />
                  </Box>
                  
                  <Text color="#F6F4D3" weight={700} className="vision-font text-center mt-2" style={{ letterSpacing: '1px' }} size="md">
                    {cartItem.name.toUpperCase()}
                  </Text>
                  
                  <Text color="dimmed" size="xs" className="vision-font text-center">
                    {t('merch_user.cart.size', { size: cartItem.selectedSize })}
                  </Text>
                  
                  <Flex align="center" justify="space-between" className="w-full mt-2 bg-[#1a1b1e] p-2 rounded-lg border border-[#333]">
                    <Text color="#5EEAD4" weight={900} className="vision-font" size="lg">
                      €{cartItem.price}
                    </Text>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => handleRemoveItem(cartItem.cartItemId)}
                      title={t('merch_user.cart.remove')}
                      size="lg"
                      radius="md"
                    >
                      <FaTrash size={16} />
                    </ActionIcon>
                  </Flex>
                </Flex>
              ))}
              </Box>

              <Divider my="sm" color="#333" />
              
              <Flex justify="space-between" align="center" px="sm">
                <Text color="#F6F4D3" weight={700} size="lg" className="vision-font" style={{ letterSpacing: '1px' }}>
                  {t('merch_user.cart.total')}
                </Text>
                <Text color="#5EEAD4" weight={900} size="lg" className="vision-font">
                  €{cartItems.reduce((acc, item) => acc + item.price, 0)}
                </Text>
              </Flex>

              <Button
                fullWidth
                mt="md"
                style={{
                  backgroundColor: "#F6F4D3",
                  color: "#000",
                  height: "40px",
                  fontSize: "1rem",
                  letterSpacing: "2px",
                }}
                className="vision-font hover:scale-[1.02] transition-transform"
                onClick={() => {
                  const total = cartItems.reduce((acc, item) => acc + item.price, 0);
                  if (total > 0) {
                    navigate("/checkout", { state: { type: 'merch', items: cartItems, amount: total } });
                    setIsModalOpen(false);
                  }
                }}
              >
                {t('merch_user.cart.checkout')}
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default Merch;
