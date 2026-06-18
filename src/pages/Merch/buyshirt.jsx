import React, { useState, useEffect } from "react";
import { Box, Text, Button, Image, Flex, Modal, ActionIcon, Divider } from "@mantine/core";
import { FaTrash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import cartImg from "../../assets/Vector.png";
import { useTranslation } from "react-i18next";

const BuyShirt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item || {
    name: "VISION SHIRT",
    price: 250,
    sizes: ["S", "M", "L", "XL"],
    image: "/assets/shirt-old.png",
    description: "",
  };

  // Build images array — prod_image (cover) is always first
  const images = (() => {
    if (!item.images?.length) {
      return item.prod_image ? [item.prod_image] : [item.image];
    }
    const cover = item.prod_image;
    if (cover) {
      const rest = item.images.filter(img => img !== cover);
      return [cover, ...rest];
    }
    return item.images;
  })();

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || "M");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const prevImage = () => setCurrentImageIdx(i => (i - 1 + images.length) % images.length);
  const nextImage = () => setCurrentImageIdx(i => (i + 1) % images.length);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleIncreaseCart = () => {
    setCartItems((prev) => [
      ...prev,
      {
        ...item,
        selectedSize,
        cartItemId: Date.now() + Math.random().toString()
      }
    ]);
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== id));
  };

  return (
    <>
      <UserHeader
        title={t('merch_user.title')}
        suffix={
          <Box className="cursor-pointer flex items-center" onClick={() => setIsModalOpen(true)}>
            <div className="relative">
              <img
                src={cartImg}
                alt="Cart Icon"
                className="!h-6 md:!h-8 lg:!h-10 xl:!h-12"
                style={{ filter: "brightness(1.5)" }}
              />
              {cartItems.length > 0 && (
                <h1 className="bg-red-600 absolute -top-2 -right-3 text-white text-xs md:text-sm px-1.5 py-0.5 rounded-full border border-white font-bold">
                  {cartItems.length}
                </h1>
              )}
            </div>
          </Box>
        }
      />

      {/* Main content — buy-shirt-page handles padding via CSS (overridden in landscape) */}
      <Box
        className="buy-shirt-page"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
          position: "relative",
        }}
      >
        <Flex
          direction="column"
          align="center"
          className="buy-shirt-outer-flex"
          style={{ width: "100%", maxWidth: "1100px" }}
        >
          <Flex
            className="flex-col md:flex-row items-center buy-shirt-content-row w-full justify-center"
          >
            {/* Image Slider Section */}
            <Box className="flex justify-center w-full md:w-[45%]">
              <Box
                className="buy-shirt-img-wrap"
                style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
              >
                {/* Padded wrapper — padding creates gap between image and arrows */}
                <Box
                  className="buy-shirt-arrow-wrap"
                  style={{
                    position: "relative",
                    padding: "0 48px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {images.length > 1 && (
                    <Box
                      onClick={prevImage}
                      className="buy-shirt-arrow vision-font"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.75)",
                        border: "1px solid rgba(246,244,211,0.5)",
                        color: "#F6F4D3",
                        cursor: "pointer",
                        fontSize: "1.4rem",
                        userSelect: "none",
                        transition: "background 0.15s",
                        zIndex: 2,
                      }}
                    >
                      ‹
                    </Box>
                  )}

                  <Image
                    src={images[currentImageIdx]}
                    alt={item.name}
                    className="w-[200px] md:w-[240px] lg:w-[300px] xl:w-[360px] buy-shirt-img"
                    style={{
                      filter: "brightness(1.1) drop-shadow(0 0 40px rgba(0,0,0,0.6))",
                      objectFit: "contain",
                      transition: "opacity 0.2s ease",
                      display: "block",
                    }}
                  />

                  {images.length > 1 && (
                    <Box
                      onClick={nextImage}
                      className="buy-shirt-arrow vision-font"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.75)",
                        border: "1px solid rgba(246,244,211,0.5)",
                        color: "#F6F4D3",
                        cursor: "pointer",
                        fontSize: "1.4rem",
                        userSelect: "none",
                        transition: "background 0.15s",
                        zIndex: 2,
                      }}
                    >
                      ›
                    </Box>
                  )}
                </Box>

                {/* Dot indicators (visible only when multiple images) */}
                {images.length > 1 && (
                  <Flex gap={6} justify="center" className="buy-shirt-dots">
                    {images.map((_, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setCurrentImageIdx(idx)}
                        style={{
                          width: idx === currentImageIdx ? "18px" : "7px",
                          height: "7px",
                          background: idx === currentImageIdx ? "#F6F4D3" : "rgba(246,244,211,0.3)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </Flex>
                )}
              </Box>
            </Box>

            {/* Details Section */}
            <Box
              className="flex flex-col items-center md:items-start text-center md:text-left buy-shirt-detail"
              style={{ flex: 1 }}
            >
              <Text
                className="vision-font lg:!text-5xl buy-shirt-title"
                style={{
                  color: "#F6F4D3",
                  letterSpacing: "5px",
                  fontSize: "2.8rem",
                  fontWeight: 900,
                  textShadow: "0 0 20px rgba(246, 244, 211, 0.4)",
                  lineHeight: 1.1,
                }}
              >
                {item.name.toUpperCase()}
              </Text>

              <Text
                className="vision-font lg:!text-4xl buy-shirt-price"
                style={{
                  color: "#5EEAD4",
                  letterSpacing: "3px",
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                }}
              >
                €{item.price}
              </Text>

              {/* Sizes */}
              <Box className="flex gap-5 items-center buy-shirt-sizes-row">
                <Text
                  className="vision-font buy-shirt-size-label"
                  style={{
                    color: "#F6F4D3",
                    letterSpacing: "2px",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                  }}
                >
                  {t('merch_user.cart.size').split(':')[0]}:
                </Text>
                <Flex gap="sm" className="buy-shirt-sizes-flex">
                  {["S", "L", "M", "E"].map((size) => (
                    <Box
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="vision-font hover:scale-110 buy-shirt-size-chip"
                      style={{
                        backgroundColor:
                          selectedSize === size ? "#F6F4D3" : "#1e1e1f",
                        color: selectedSize === size ? "#111827" : "#fff",
                        width: "42px",
                        height: "42px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        border: "1px solid #F6F4D3",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {size}
                    </Box>
                  ))}
                </Flex>
              </Box>

              {/* Add to Cart Button */}
              <Button
                onClick={handleIncreaseCart}
                className="vision-font hover:scale-105 transition-all duration-300 active:scale-95 buy-shirt-add-btn"
                style={{
                  backgroundColor: "#000",
                  color: "#FFF",
                  border: "2px solid #F6F4D3",
                  borderRadius: "12px",
                  fontSize: "1.5rem",
                  padding: "1rem 3.5rem",
                  height: "auto",
                  letterSpacing: "2px",
                  fontWeight: 900,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                {t('merch_user.buy_shirt.add_to_cart')}
              </Button>

              {/* Thumbnails — hidden in landscape, show only when multiple images */}
              {images.length > 1 && (
                <Flex gap="md" mt={16} className="buy-shirt-thumbs">
                  {images.map((img, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setCurrentImageIdx(idx)}
                      style={{
                        width: "68px",
                        height: "68px",
                        border: `2px solid ${idx === currentImageIdx ? "#F6F4D3" : "#333"}`,
                        background: "rgba(255,255,255,0.03)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        overflow: "hidden",
                        transition: "border-color 0.2s ease",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={img}
                        style={{
                          width: "85%",
                          height: "85%",
                          objectFit: "contain",
                          opacity: idx === currentImageIdx ? 1 : 0.45,
                          transition: "opacity 0.2s ease",
                        }}
                      />
                    </Box>
                  ))}
                </Flex>
              )}
            </Box>
          </Flex>
        </Flex>
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

                  <Flex align="center" justify="space-between" className="w-full mt-2 bg-[#1a1b1e] p-2 rounded-none border border-[#333]">
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

export default BuyShirt;
