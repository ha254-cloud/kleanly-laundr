import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Plus, Minus, ShoppingCart, MapPin, Clock, Phone, Sparkles, Package2, Info, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PaymentSelectionModal } from '../../components/PaymentSelectionModal';
import { OrderSuccessModal } from '../../components/OrderSuccessModal';
import { ReceiptModal } from '../../components/ReceiptModal';
import { WhatsAppButton } from '../../components/ui/WhatsAppButton';

const { width } = Dimensions.get('window');

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends ServiceItem {
  quantity: number;
}

interface BagService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface BagCartItem extends BagService {
  quantity: number;
}

const services: ServiceItem[] = [
  // Wash & Fold
  { id: 'shirt', name: 'Shirt', price: 150, category: 'wash-fold' },
  { id: 'trouser', name: 'Trouser', price: 200, category: 'wash-fold' },
  { id: 'dress', name: 'Dress', price: 250, category: 'wash-fold' },
  { id: 'bedsheet', name: 'Bed Sheet', price: 300, category: 'wash-fold' },
  { id: 'towel', name: 'Towel', price: 100, category: 'wash-fold' },
  
  // Dry Cleaning
  { id: 'suit', name: 'Suit', price: 800, category: 'dry-cleaning' },
  { id: 'coat', name: 'Coat', price: 600, category: 'dry-cleaning' },
  { id: 'blazer', name: 'Blazer', price: 500, category: 'dry-cleaning' },
  { id: 'silk-dress', name: 'Silk Dress', price: 700, category: 'dry-cleaning' },
  { id: 'tie', name: 'Tie', price: 150, category: 'dry-cleaning' },
  
  // Ironing
  { id: 'shirt-iron', name: 'Shirt (Iron)', price: 80, category: 'ironing' },
  { id: 'trouser-iron', name: 'Trouser (Iron)', price: 100, category: 'ironing' },
  { id: 'dress-iron', name: 'Dress (Iron)', price: 120, category: 'ironing' },
  { id: 'bedsheet-iron', name: 'Bed Sheet (Iron)', price: 150, category: 'ironing' },
  
  // Shoe Cleaning
  { id: 'leather-shoes', name: 'Leather Shoes', price: 300, category: 'shoe-cleaning' },
  { id: 'sneakers', name: 'Sneakers', price: 250, category: 'shoe-cleaning' },
  { id: 'boots', name: 'Boots', price: 400, category: 'shoe-cleaning' },
  { id: 'sandals', name: 'Sandals', price: 200, category: 'shoe-cleaning' },
];

// Pay-per-bag services adapted for Kenya
const bagServices: BagService[] = [
  // Casuals - Wash & Fold
  { id: 'casuals-bag', name: 'Casuals Bag', description: 'Everyday clothes - wash & fold service', price: 800, category: 'wash-fold' },
  
  // Delicates - Clean & Press
  { id: 'delicates-bag', name: 'Delicates Bag', description: 'Smart wear - clean & press service', price: 1200, category: 'dry-cleaning' },
  
  // Home Linens
  { id: 'home-bag', name: 'Home Linens Bag', description: 'Bedding & towels - wash & fold service', price: 1000, category: 'wash-fold' },
  
  // Press Only
  { id: 'press-bag', name: 'Press Only Bag', description: 'Clean items that need pressing only', price: 600, category: 'ironing' },
  
  // Kids Uniforms
  { id: 'kids-uniforms-bag', name: 'Kids Uniforms Bag', description: 'School uniforms - wash & press service', price: 700, category: 'wash-fold' },
];

import washFoldImg from '../../assets/images/wash-fold.jpg';
import dryCleaningImg from '../../assets/images/dry cleaning.jpg';
import ironingImg from '../../assets/images/ironing.jpg';
import shoeCleaningImg from '../../assets/images/shoe cleaning.jpg';

const serviceCategories = [
  { id: 'wash-fold', name: 'Wash & Fold', image: washFoldImg },
  { id: 'dry-cleaning', name: 'Dry Cleaning', image: dryCleaningImg },
  { id: 'ironing', name: 'Ironing', image: ironingImg },
  { id: 'shoe-cleaning', name: 'Shoe Cleaning', image: shoeCleaningImg },
];
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    width: '100%',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  serviceItemSelected: {
    shadowColor: '#51CF66',
    shadowOpacity: 0.2,
    elevation: 8,
    borderColor: '#51CF66',
    borderWidth: 2,
  },
  // ... (rest of your styles object here)
});

export default function BookingScreen() {
  const { isDark } = useTheme();
  // const { user } = useAuth();
  const { createOrder } = useOrders();
  const colors = isDark ? Colors.dark : Colors.light;

  // Admin passkey state
  const [adminPasskey, setAdminPasskey] = useState('');
  const [adminAccess, setAdminAccess] = useState(false);

  // Selected category state
  const [selectedCategory, setSelectedCategory] = useState(serviceCategories[0].id);

  // Order/cart state
  const [orderType, setOrderType] = useState<'per-item' | 'per-bag'>('per-item');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bagCart, setBagCart] = useState<BagCartItem[]>([]);
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  // Filtered services by selected category
  const filteredServices = services.filter(s => s.category === selectedCategory);
  const filteredBagServices = bagServices.filter(s => s.category === selectedCategory);

  const handleAdminLogin = () => {
    if (adminPasskey === '12110') {
      setAdminAccess(true);
      Alert.alert('Admin Access Granted', 'You can now access admin tools.');
    } else {
      Alert.alert('Incorrect Passkey', 'Please try again.');
    }
  };

  // Add to cart for per-item
  const addToCart = (service: ServiceItem) => {
    setCart((prev: CartItem[]) => {
      const existing = prev.find((item: CartItem) => item.id === service.id);
      if (existing) {
        return prev.map((item: CartItem) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  };

  // Remove from cart for per-item
  const removeFromCart = (serviceId: string) => {
    setCart((prev: CartItem[]) => {
      const existing = prev.find((item: CartItem) => item.id === serviceId);
      if (existing && existing.quantity > 1) {
        return prev.map((item: CartItem) =>
          item.id === serviceId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item: CartItem) => item.id !== serviceId);
    });
  };

  // Get quantity for per-item
  const getItemQuantity = (serviceId: string) => {
    const item = cart.find((item: CartItem) => item.id === serviceId);
    return item ? item.quantity : 0;
  };

  // Add to cart for per-bag
  const addToBagCart = (service: BagService) => {
    setBagCart((prev: BagCartItem[]) => {
      const existing = prev.find((item: BagCartItem) => item.id === service.id);
      if (existing) {
        return prev.map((item: BagCartItem) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  };

  // Remove from cart for per-bag
  const removeFromBagCart = (serviceId: string) => {
    setBagCart((prev: BagCartItem[]) => {
      const existing = prev.find((item: BagCartItem) => item.id === serviceId);
      if (existing && existing.quantity > 1) {
        return prev.map((item: BagCartItem) =>
          item.id === serviceId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item: BagCartItem) => item.id !== serviceId);
    });
  };

  // Get quantity for per-bag
  const getBagItemQuantity = (serviceId: string) => {
    const item = bagCart.find((item: BagCartItem) => item.id === serviceId);
    return item ? item.quantity : 0;
  };

  // Get current cart
  const getCurrentCart = () => {
    return orderType === 'per-item' ? cart : bagCart;
  };

  // Get total amount
  const getTotalAmount = () => {
    if (orderType === 'per-item') {
      return cart.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
    } else {
      return bagCart.reduce((total: number, item: BagCartItem) => total + (item.price * item.quantity), 0);
    }
  };

  // (removed duplicate and misplaced logic here)

  const handleCheckout = () => {
    const currentCart = getCurrentCart();
    if (currentCart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    if (!area.trim()) {
      Alert.alert('Missing Information', 'Please enter your delivery area.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number.');
      return;
    }

    if (!pickupTime.trim()) {
      Alert.alert('Missing Information', 'Please enter your preferred pickup time.');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSelected = async (paymentMethod: string, _paymentDetails?: any): Promise<void> => {
    try {
      const currentCart = getCurrentCart();
      const newOrderData = {
        category: selectedCategory,
        items: currentCart.map((item: any) => `${item.name} (x${item.quantity})`),
        total: getTotalAmount(),
        address: area,
        date: pickupDate,
        pickupTime: `${pickupDate} at ${pickupTime}`,
        deliveryTime: deliveryTime ? `${deliveryDate} at ${deliveryTime}` : 'Standard delivery',
        phone,
        paymentMethod,
        orderType,
        notes: `Phone: ${phone}, Payment: ${paymentMethod}, Order Type: ${orderType}, Pickup: ${pickupDate} at ${pickupTime}, Delivery: ${deliveryTime ? `${deliveryDate} at ${deliveryTime}` : 'Standard delivery'}`,
        status: 'pending' as const,
      };

      const createdOrderId = await createOrder(newOrderData);

      // Create order data for modals
      const modalOrderData = {
        orderId: createdOrderId,
        service: selectedCategory.replace('-', ' ').toUpperCase(),
        items: currentCart.map((item: any) => `${item.name} (x${item.quantity})`),
        total: getTotalAmount(),
        area,
        phone,
        pickupTime: `${pickupDate} at ${pickupTime}`,
        paymentMethod,
        isPaid: paymentMethod !== 'cash',
      };

      setOrderData(modalOrderData);

      // Reset form
      setCart([]);
      setBagCart([]);
      setArea('');
      setPhone('');
      setPickupTime('');
      setDeliveryTime('');
      setShowPaymentModal(false);
      setShowSuccessModal(true);

    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Premium Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'E6', colors.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.titleSection}>
                <View style={styles.titleRow}>
                  <Sparkles size={28} color="#FFFFFF" />
                  <Text style={styles.title}>Book Service</Text>
                </View>
                <Text style={styles.subtitle}>
                  Premium laundry at your fingertips
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Order Type Selection */}
        <View style={styles.orderTypeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose Order Type
          </Text>
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity
              style={[
                styles.orderTypeCard,
                orderType === 'per-item' && styles.orderTypeCardSelected,
                { backgroundColor: colors.surface }
              ]}
              onPress={() => setOrderType('per-item')}
              activeOpacity={0.8}
            >
              {orderType === 'per-item' && (
                <LinearGradient
                  colors={[colors.primary, colors.primary + 'E6']}
                  style={styles.orderTypeGradient}
                />
              )}
              <View style={styles.orderTypeContent}>
                <View style={[
                  styles.orderTypeIcon,
                  { backgroundColor: orderType === 'per-item' ? 'rgba(255,255,255,0.2)' : colors.primary + '20' }
                ]}>
                  <Sparkles size={24} color={orderType === 'per-item' ? '#FFFFFF' : colors.primary} />
                </View>
                <Text style={[
                  styles.orderTypeTitle,
                  { color: orderType === 'per-item' ? '#FFFFFF' : colors.text }
                ]}>
                  Pay per Item
                </Text>
                <Text style={[
                  styles.orderTypeDescription,
                  { color: orderType === 'per-item' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                ]}>
                  Ideal for few pieces{'\n'}Ultimate flexibility!
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.orderTypeCard,
                orderType === 'per-bag' && styles.orderTypeCardSelected,
                { backgroundColor: colors.surface }
              ]}
              onPress={() => setOrderType('per-bag')}
              activeOpacity={0.8}
            >
              {orderType === 'per-bag' && (
                <LinearGradient
                  colors={[colors.primary, colors.primary + 'E6']}
                  style={styles.orderTypeGradient}
                />
              )}
              <View style={styles.orderTypeContent}>
                <View style={[
                  styles.orderTypeIcon,
                  { backgroundColor: orderType === 'per-bag' ? 'rgba(255,255,255,0.2)' : colors.success + '20' }
                ]}>
                  <Package2 size={24} color={orderType === 'per-bag' ? '#FFFFFF' : colors.success} />
                </View>
                <Text style={[
                  styles.orderTypeTitle,
                  { color: orderType === 'per-bag' ? '#FFFFFF' : colors.text }
                ]}>
                  Pay per Bag
                </Text>
                <Text style={[
                  styles.orderTypeDescription,
                  { color: orderType === 'per-bag' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                ]}>
                  Ideal for bigger piles{'\n'}One price per bag!
                </Text>
                {orderType === 'per-bag' && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>POPULAR</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose Service Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {serviceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}
              >
                {selectedCategory === category.id && (
                  <LinearGradient
                    colors={[colors.primary, colors.primary + 'E6']}
                    style={styles.categoryGradient}
                  />
                )}
                <View style={[
                  styles.categoryIconContainer,
                  { backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : colors.surface }
                ]}>
                  <Image
                    source={category.image}
                    style={styles.categoryImage}
                    accessibilityLabel={category.name}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryName,
                    {
                      color: selectedCategory === category.id ? '#FFFFFF' : colors.text,
                      fontWeight: selectedCategory === category.id ? '700' : '600',
                    },
                  ]}
                >
                  {category.name}
                </Text>
                {selectedCategory === category.id && (
                  <View style={styles.selectedIndicator}>
                    <View style={styles.selectedDot} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Service Items - Per Item */}
        {orderType === 'per-item' && (
          <View style={styles.servicesSection}>
            <Text style={[styles.servicesSectionTitle, { color: colors.text }]}>
              Available Services
            </Text>
            {filteredServices.map((service) => {
              const quantity = getItemQuantity(service.id);
              const isInCart = quantity > 0;

              return (
                <TouchableOpacity
                  key={service.id}
                  activeOpacity={0.9}
                  onPress={() => addToCart(service)}
                >
                  <Card style={[
                    styles.serviceItem,
                    isInCart && styles.serviceItemSelected,
                    {
                      borderColor: isInCart ? colors.primary : 'transparent',
                      borderWidth: isInCart ? 2 : 0,
                    }
                  ]}>
                    <View style={styles.serviceContent}>
                      <View style={styles.serviceInfo}>
                        <Text style={[styles.serviceName, { color: colors.text }]}>
                          {service.name}
                        </Text>
                        <Text style={[styles.servicePrice, { color: colors.primary }]}>
                          KSH {service.price}
                        </Text>
                      </View>
                      <View style={styles.quantityControls}>
                        {quantity > 0 && (
                          <>
                            <TouchableOpacity
                              style={[styles.quantityButton, styles.removeButton]}
                              onPress={() => removeFromCart(service.id)}
                              activeOpacity={0.8}
                            >
                              <Minus size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                            <View style={styles.quantityDisplay}>
                              <Text style={styles.quantityText}>{quantity}</Text>
                            </View>
                          </>
                        )}
                        <TouchableOpacity
                          style={[styles.quantityButton, styles.addButton]}
                          onPress={() => addToCart(service)}
                          activeOpacity={0.8}
                        >
                          <Plus size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {isInCart && (
                      <View style={[styles.inCartBadge, { backgroundColor: colors.success }]}>
                        <Text style={styles.inCartText}>In Cart</Text>
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {/* Bag Services - Per Bag */}
        {orderType === 'per-bag' && (
          <View style={styles.servicesSection}>
            <View style={styles.bagServicesHeader}>
              <Text style={[styles.servicesSectionTitle, { color: colors.text }]}>
                Bag Services
              </Text>
              <TouchableOpacity style={[styles.infoButton, { backgroundColor: colors.primary + '20' }]}>
                <Info size={16} color={colors.primary} />
                <Text style={[styles.infoButtonText, { color: colors.primary }]}>
                  Bag Info
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.bagServicesSubtitle, { color: colors.textSecondary }]}>
              How many bags for each service do you need?
            </Text>
            {filteredBagServices.map((service) => {
              const quantity = getBagItemQuantity(service.id);
              const isInCart = quantity > 0;

              return (
                <TouchableOpacity
                  key={service.id}
                  activeOpacity={0.9}
                  onPress={() => addToBagCart(service)}
                >
                  <Card style={[
                    styles.bagServiceItem,
                    isInCart && styles.serviceItemSelected,
                    {
                      borderColor: isInCart ? colors.primary : 'transparent',
                      borderWidth: isInCart ? 2 : 0,
                    }
                  ]}>
                    <View style={styles.bagServiceContent}>
                      <View style={styles.bagServiceInfo}>
                        <View style={styles.bagServiceHeader}>
                          <Text style={[styles.bagServiceName, { color: colors.text }]}>
                            {service.name}
                          </Text>
                          <View style={[styles.bagServiceBadge, { backgroundColor: colors.success + '20' }]}>
                            <Package2 size={12} color={colors.success} />
                            <Text style={[styles.bagServiceBadgeText, { color: colors.success }]}>
                              Per Bag
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.bagServiceDescription, { color: colors.textSecondary }]}>
                          {service.description}
                        </Text>
                        <Text style={[styles.bagServicePrice, { color: colors.primary }]}>
                          KSH {service.price}
                        </Text>
                      </View>
                      <View style={styles.quantityControls}>
                        {quantity > 0 && (
                          <>
                            <TouchableOpacity
                              style={[styles.quantityButton, styles.removeButton]}
                              onPress={() => removeFromBagCart(service.id)}
                              activeOpacity={0.8}
                            >
                              <Minus size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                            <View style={styles.quantityDisplay}>
                              <Text style={styles.quantityText}>{quantity}</Text>
                            </View>
                          </>
                        )}
                        <TouchableOpacity
                          style={[styles.quantityButton, styles.addButton]}
                          onPress={() => addToBagCart(service)}
                          activeOpacity={0.8}
                        >
                          <Plus size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {isInCart && (
                      <View style={[styles.inCartBadge, { backgroundColor: colors.success }]}>
                        <Text style={styles.inCartText}>In Cart</Text>
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
                  <View style={styles.deliverySection}>
                    <Text style={[styles.deliverySectionTitle, { color: colors.text }]}>
                      Delivery Details
                    </Text>

                    <Card style={styles.deliveryCard}>
                      <View style={styles.inputGroup}>
                        <View style={[styles.inputIconContainer, { backgroundColor: colors.primary + '15' }]}>
                          <MapPin size={20} color={colors.primary} />
                        </View>
                        <TextInput
                          style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
                          placeholder="Delivery area (e.g., Westlands, Karen)"
                          placeholderTextColor={colors.textSecondary}
                          value={area}
                          onChangeText={setArea} />
                      </View>

                      <View style={styles.inputGroup}>
                        <View style={[styles.inputIconContainer, { backgroundColor: colors.primary + '15' }]}>
                          <Phone size={20} color={colors.primary} />
                        </View>
                        <TextInput
                          style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
                          placeholder="Phone number"
                          placeholderTextColor={colors.textSecondary}
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad" />
                      </View>

                      <View style={styles.inputGroup}>
                        <View style={[styles.inputIconContainer, { backgroundColor: colors.primary + '15' }]}>
                          <Clock size={20} color={colors.primary} />
                        </View>
                        <TextInput
                          style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
                          placeholder="Preferred pickup time (e.g., 2:00 PM)"
                          placeholderTextColor={colors.textSecondary}
                          value={pickupTime}
                          onChangeText={setPickupTime} />
                      </View>

                      <View style={styles.inputGroup}>
                        <View style={[styles.inputIconContainer, { backgroundColor: colors.success + '15' }]}>
                          <Calendar size={20} color={colors.success} />
                        </View>
                        <TextInput
                          style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
                          placeholder="Delivery time (e.g., 3:00 PM tomorrow)"
                          placeholderTextColor={colors.textSecondary}
                          value={deliveryTime}
                          onChangeText={setDeliveryTime} />
                      </View>
                    </Card>
                  </View>

                  {/* Premium Checkout Button */}
                  <View style={styles.checkoutSection}>
                    <LinearGradient
                      colors={getCurrentCart().length > 0 ? [colors.primary, colors.primary + 'E6'] : [colors.border, colors.border]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.checkoutGradient, { opacity: getCurrentCart().length === 0 ? 0.5 : 1 }]}
                    >
                      <TouchableOpacity
                        style={styles.checkoutButton}
                        onPress={handleCheckout}
                        disabled={getCurrentCart().length === 0}
                        activeOpacity={0.9}
                      >
                        <ShoppingCart size={24} color="#FFFFFF" />
                        <Text style={styles.checkoutButtonText}>
                          {getCurrentCart().length === 0
                            ? 'Add items to checkout'
                            : `Checkout - KSH ${getTotalAmount().toLocaleString()}`}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
      </ScrollView>
      <PaymentSelectionModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={getTotalAmount()}
        onPaymentSelected={handlePaymentSelected}
      />

      {orderData && (
        <OrderSuccessModal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          orderData={orderData}
          onViewReceipt={() => {
            setShowSuccessModal(false);
            setShowReceiptModal(true);
          }}
        />
      )}

      {orderData && (
        <ReceiptModal
          visible={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          orderData={orderData}
        />
      )}

      {/* Floating WhatsApp Button */}
      <WhatsAppButton 
        phoneNumber="+254700000000" 
        message="Hello! I need help with booking my laundry service." 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    width: '100%',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  orderTypeSection: {
    marginBottom: 32,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  orderTypeCard: {
    flex: 1,
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  orderTypeCardSelected: {
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    elevation: 12,
  },
  orderTypeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orderTypeContent: {
    padding: 24,
    alignItems: 'center',
    minHeight: 160,
  },
  orderTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  orderTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  orderTypeDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  categoriesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingLeft: 20,
  },
  categoriesContent: {
    paddingRight: 20,
    gap: 16,
  },
  categoryCard: {
    position: 'relative',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    minWidth: 140,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: '#FFFFFF',
  },
  categoryCardSelected: {
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    elevation: 12,
  },
  categoryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  servicesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  servicesSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  bagServicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  infoButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bagServicesSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  bagServiceItem: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  bagServiceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  bagServiceInfo: {
    flex: 1,
    marginRight: 16,
  },
  bagServiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bagServiceName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  bagServiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  bagServiceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bagServiceDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  bagServicePrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  serviceItem: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  serviceItemSelected: {
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
    elevation: 8,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
  },
  addButton: {
    backgroundColor: '#51CF66',
  },
  quantityDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  inCartBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inCartText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cartSection: {
    marginBottom: 32,
  },
  cartGradient: {
    paddingHorizontal: 20,
  },
  cartSummary: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cartIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cartHeaderText: {
    flex: 1,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  cartSubtitle: {
    fontSize: 14,
  },
  cartBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cartItems: {
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cartItemDetails: {
    fontSize: 12,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    marginTop: 16,
    borderTopWidth: 2,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  deliverySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  deliverySectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  deliveryCard: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  input: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  checkoutGradient: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

// declare module '*.png' {
//   const value: any;
//   export default value;
// }
