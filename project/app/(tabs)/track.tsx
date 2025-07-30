import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Search, Package, Clock, CircleCheck as CheckCircle, Truck, MapPin, Phone, Calendar, Sparkles, TrendingUp, Award, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useOrders } from '../../context/OrderContext';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Order } from '../../services/orderService';
import { WhatsAppButton } from '../../components/ui/WhatsAppButton';

const { width } = Dimensions.get('window');

export default function TrackOrderScreen() {
  const { isDark } = useTheme();
  const { orders, refreshOrders, loading } = useOrders();
  const colors = isDark ? Colors.dark : Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshOrders();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh orders. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={24} color={colors.warning} />;
      case 'confirmed':
        return <Package size={24} color={colors.primary} />;
      case 'in-progress':
        return <Truck size={24} color="#3B82F6" />;
      case 'completed':
        return <CheckCircle size={24} color={colors.success} />;
      default:
        return <Clock size={24} color={colors.textSecondary} />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'confirmed':
        return colors.primary;
      case 'in-progress':
        return '#3B82F6';
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusSteps = (currentStatus: Order['status']) => {
    const steps = [
      { 
        key: 'pending', 
        label: 'Order Placed', 
        description: 'Your order has been received and is being reviewed',
        icon: <Clock size={16} color="#FFFFFF" />
      },
      { 
        key: 'confirmed', 
        label: 'Confirmed', 
        description: 'Order confirmed and pickup scheduled',
        icon: <Package size={16} color="#FFFFFF" />
      },
      { 
        key: 'in-progress', 
        label: 'In Progress', 
        description: 'Your items are being cleaned and processed',
        icon: <Truck size={16} color="#FFFFFF" />
      },
      { 
        key: 'completed', 
        label: 'Ready', 
        description: 'Items ready for delivery or pickup',
        icon: <CheckCircle size={16} color="#FFFFFF" />
      },
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStatus);
    
    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCurrent: step.key === currentStatus,
    }));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter an order ID to track your order');
      return;
    }

    const order = orders.find(o => 
      o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id?.slice(-6).toLowerCase() === searchQuery.toLowerCase()
    );

    if (order) {
      setSelectedOrder(order);
    } else {
      Alert.alert(
        'Order Not Found', 
        'No order found with this ID. Please check the order ID and try again, or select from your recent orders below.'
      );
    }
  };

  const formatOrderId = (id?: string) => {
    return id ? `#${id.slice(-6).toUpperCase()}` : '#------';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getEstimatedDelivery = (order: Order) => {
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);
    
    // Add 2-3 days for delivery based on service type
    const daysToAdd = order.category === 'dry-cleaning' ? 3 : 2;
    deliveryDate.setDate(orderDate.getDate() + daysToAdd);
    
    return deliveryDate.toLocaleDateString('en-KE', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Premium Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'F0', colors.primary + 'E6', colors.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.titleSection}>
                <View style={styles.titleRow}>
                  <View style={styles.titleIconContainer}>
                    <Search size={28} color="#FFFFFF" />
                    <View style={styles.titleIconGlow} />
                  </View>
                  <Text style={styles.title}>Track Order</Text>
                </View>
                <Text style={styles.subtitle}>
                  Monitor your laundry journey in real-time
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleRefresh}
                style={styles.refreshButton}
                disabled={isRefreshing}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                  style={styles.refreshGradient}
                >
                  <RefreshCw 
                    size={20} 
                    color="#FFFFFF" 
                    style={[
                      styles.refreshIcon,
                      isRefreshing && styles.refreshIconSpinning
                    ]} 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFF', '#F0F4FF']}
            style={styles.searchGradient}
          >
            <Card style={styles.searchCard}>
              <View style={styles.searchHeader}>
                <View style={[styles.searchIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Search size={24} color={colors.primary} />
                </View>
                <View style={styles.searchHeaderText}>
                  <Text style={[styles.searchTitle, { color: colors.text }]}>
                    Find Your Order
                  </Text>
                  <Text style={[styles.searchSubtitle, { color: colors.textSecondary }]}>
                    Enter your order ID to get real-time updates
                  </Text>
                </View>
              </View>
              
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Enter order ID (e.g., ABC123)"
                leftIcon={<Search size={20} color={colors.textSecondary} />}
                style={styles.searchInput}
              />
              
              <LinearGradient
                colors={[colors.primary, colors.primary + 'E6']}
                style={styles.searchButtonGradient}
              >
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                  activeOpacity={0.9}
                >
                  <Search size={20} color="#FFFFFF" />
                  <Text style={styles.searchButtonText}>Track Order</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Card>
          </LinearGradient>
        </View>

        {/* Order Details */}
        {selectedOrder && (
          <View style={styles.orderSection}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFF']}
              style={styles.orderGradient}
            >
              <Card style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={[styles.orderId, { color: colors.text }]}>
                      {formatOrderId(selectedOrder.id)}
                    </Text>
                    <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                      Placed on {formatDate(selectedOrder.createdAt)}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(selectedOrder.status) + '20' }
                  ]}>
                    {getStatusIcon(selectedOrder.status)}
                    <Text style={[
                      styles.statusText, 
                      { color: getStatusColor(selectedOrder.status) }
                    ]}>
                      {selectedOrder.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Order Summary */}
                <View style={styles.orderSummary}>
                  <View style={styles.summaryRow}>
                    <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Package size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Service:</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {selectedOrder.category.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <View style={[styles.summaryIcon, { backgroundColor: colors.success + '20' }]}>
                      <MapPin size={16} color={colors.success} />
                    </View>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Area:</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {selectedOrder.address}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <View style={[styles.summaryIcon, { backgroundColor: colors.warning + '20' }]}>
                      <Calendar size={16} color={colors.warning} />
                    </View>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Est. Delivery:</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {getEstimatedDelivery(selectedOrder)}
                    </Text>
                  </View>
                  
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Award size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: '700' }]}>Total:</Text>
                    <Text style={[styles.totalAmount, { color: colors.primary }]}>
                      KSH {selectedOrder.total.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </Card>
            </LinearGradient>

            {/* Progress Timeline */}
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFF']}
              style={styles.progressGradient}
            >
              <Card style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <View style={[styles.progressIconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <TrendingUp size={24} color={colors.primary} />
                  </View>
                  <View style={styles.progressHeaderText}>
                    <Text style={[styles.progressTitle, { color: colors.text }]}>
                      Order Progress
                    </Text>
                    <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                      Track your order journey step by step
                    </Text>
                  </View>
                </View>
                
                <View style={styles.timelineContainer}>
                  {getStatusSteps(selectedOrder.status).map((step, index) => (
                    <View key={step.key} style={styles.timelineStep}>
                      <View style={styles.timelineIndicator}>
                        <View
                          style={[
                            styles.timelineDot,
                            {
                              backgroundColor: step.isActive ? getStatusColor(selectedOrder.status) : colors.border,
                            },
                          ]}
                        >
                          {step.isActive && step.icon}
                        </View>
                        {index < 3 && (
                          <View
                            style={[
                              styles.timelineLine,
                              {
                                backgroundColor: step.isActive && index < getStatusSteps(selectedOrder.status).findIndex(s => s.isCurrent) 
                                  ? getStatusColor(selectedOrder.status) 
                                  : colors.border,
                              },
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text
                          style={[
                            styles.timelineLabel,
                            {
                              color: step.isActive ? colors.text : colors.textSecondary,
                              fontWeight: step.isCurrent ? '700' : '600',
                            },
                          ]}
                        >
                          {step.label}
                        </Text>
                        <Text style={[styles.timelineDescription, { color: colors.textSecondary }]}>
                          {step.description}
                        </Text>
                        {step.isCurrent && (
                          <View style={[styles.currentBadge, { backgroundColor: getStatusColor(selectedOrder.status) + '20' }]}>
                            <Text style={[styles.currentBadgeText, { color: getStatusColor(selectedOrder.status) }]}>
                              Current Status
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            </LinearGradient>

            {/* Items List */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFF']}
                style={styles.itemsGradient}
              >
                <Card style={styles.itemsCard}>
                  <View style={styles.itemsHeader}>
                    <View style={[styles.itemsIconContainer, { backgroundColor: colors.success + '20' }]}>
                      <Package size={24} color={colors.success} />
                    </View>
                    <View style={styles.itemsHeaderText}>
                      <Text style={[styles.itemsTitle, { color: colors.text }]}>
                        Items in Order ({selectedOrder.items.length})
                      </Text>
                      <Text style={[styles.itemsSubtitle, { color: colors.textSecondary }]}>
                        Your laundry items being processed
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.itemsList}>
                    {selectedOrder.items.map((item, index) => (
                      <View key={index} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                        <View style={[styles.itemIcon, { backgroundColor: colors.primary + '15' }]}>
                          <Text style={[styles.itemNumber, { color: colors.primary }]}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text style={[styles.itemText, { color: colors.text }]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </LinearGradient>
            )}
          </View>
        )}

        {/* Recent Orders for Quick Access */}
        {orders.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <View style={styles.recentTitleContainer}>
                <Text style={[styles.recentTitle, { color: colors.text }]}>
                  Your Recent Orders
                </Text>
                <Text style={[styles.recentSubtitle, { color: colors.textSecondary }]}>
                  Quick access to your order history
                </Text>
              </View>
            </View>
            
            <View style={styles.recentOrdersList}>
              {orders.slice(0, 4).map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.recentOrderWrapper}
                  onPress={() => setSelectedOrder(order)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8FAFF']}
                    style={styles.recentOrderGradient}
                  >
                    <Card style={styles.recentOrder}>
                      <View style={styles.recentOrderContent}>
                        <View style={styles.recentOrderLeft}>
                          <View style={[
                            styles.recentOrderIcon, 
                            { backgroundColor: getStatusColor(order.status) + '20' }
                          ]}>
                            {getStatusIcon(order.status)}
                          </View>
                          <View style={styles.recentOrderInfo}>
                            <Text style={[styles.recentOrderId, { color: colors.text }]}>
                              {formatOrderId(order.id)}
                            </Text>
                            <Text style={[styles.recentOrderDate, { color: colors.textSecondary }]}>
                              {formatShortDate(order.createdAt)} • {order.category.replace('-', ' ')}
                            </Text>
                            <Text style={[styles.recentOrderTotal, { color: colors.primary }]}>
                              KSH {order.total.toLocaleString()}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.recentOrderArrow, { backgroundColor: colors.primary + '15' }]}>
                          <Text style={[styles.arrowText, { color: colors.primary }]}>→</Text>
                        </View>
                      </View>
                    </Card>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {orders.length === 0 && !selectedOrder && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[colors.primary + '10', colors.primary + '05']}
              style={styles.emptyStateGradient}
            >
              <Card style={styles.emptyStateCard}>
                <View style={[styles.emptyStateIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Package size={48} color={colors.primary} />
                </View>
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  No Orders Yet
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  You haven't placed any orders yet. Start by booking your first laundry service!
                </Text>
                <LinearGradient
                  colors={[colors.primary, colors.primary + 'E6']}
                  style={styles.emptyStateButtonGradient}
                >
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => {/* Navigate to order screen */}}
                  >
                    <Text style={styles.emptyStateButtonText}>Book Your First Order</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </Card>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
      
      {/* Floating WhatsApp Button */}
      <WhatsAppButton 
        phoneNumber="+254700000000" 
        message="Hello! I need help tracking my laundry order." 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Styles
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    marginBottom: 24,
    position: 'relative',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    position: 'relative',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  titleIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleIconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    opacity: 0.6,
    zIndex: -1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    lineHeight: 24,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  refreshGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  refreshIcon: {
    // Animation would be handled by React Native Reanimated in a real app
  },
  refreshIconSpinning: {
    // Spinning animation styles
  },
  
  // Search Section Styles
  searchSection: {
    marginBottom: 24,
  },
  searchGradient: {
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  searchCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  searchHeaderText: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  searchSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchInput: {
    marginBottom: 20,
  },
  searchButtonGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Order Section Styles
  orderSection: {
    marginBottom: 24,
  },
  orderGradient: {
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  orderCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 15,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderSummary: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '500',
    minWidth: 80,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  totalRow: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Progress Section Styles
  progressGradient: {
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  progressCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  progressHeaderText: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  timelineContainer: {
    gap: 20,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 20,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineLine: {
    width: 3,
    height: 32,
    marginTop: 8,
    borderRadius: 2,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  currentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Items Section Styles
  itemsGradient: {
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  itemsCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemsHeaderText: {
    flex: 1,
  },
  itemsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemsSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 16,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  
  // Recent Orders Styles
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  recentHeader: {
    marginBottom: 20,
  },
  recentTitleContainer: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  recentSubtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  recentOrdersList: {
    gap: 12,
  },
  recentOrderWrapper: {
    // Wrapper for touch feedback
  },
  recentOrderGradient: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  recentOrder: {
    padding: 0,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  recentOrderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  recentOrderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentOrderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recentOrderInfo: {
    flex: 1,
  },
  recentOrderId: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  recentOrderDate: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  recentOrderTotal: {
    fontSize: 15,
    fontWeight: '700',
  },
  recentOrderArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Empty State Styles
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyStateGradient: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyStateCard: {
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '500',
  },
  emptyStateButtonGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});