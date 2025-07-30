import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { 
  User, 
  Settings, 
  LogOut, 
  CircleHelp as HelpCircle, 
  Bell, 
  MapPin, 
  CreditCard, 
  Star, 
  Gift, 
  Shield, 
  ChartBar as BarChart3, 
  ShoppingBag, 
  Package,
  X,
  Crown,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WhatsAppButton } from '../../components/ui/WhatsAppButton';

const { width } = Dimensions.get('window');

interface InfoModalProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ visible, title, content, onClose }) => {
  const colors = Colors.light;
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.primary + '10', colors.primary + '05']}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Sparkles size={24} color={colors.primary} />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.modalContent, { color: colors.textSecondary }]}>{content}</Text>
            
            <LinearGradient
              colors={[colors.primary, colors.primary + 'E6']}
              style={styles.modalButtonGradient}
            >
              <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                <Text style={styles.modalButtonText}>Got it!</Text>
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default function ProfileScreen() {
  const [infoModal, setInfoModal] = useState<{title: string, content: string} | null>(null);
  const { user, logout } = useAuth();
  const colors = Colors.light;

  // Check if user is admin
  const isAdmin = user?.email === 'admin@kleanly.co.ke';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: <ShoppingBag size={20} color={colors.primary} />,
      title: 'Order History',
      subtitle: 'View your past and current orders',
      color: colors.primary,
      onPress: () => router.push('/orders'),
      badge: 'Active',
    },
    {
      icon: <Package size={20} color="#10B981" />,
      title: 'Track Orders',
      subtitle: 'Track your current orders',
      color: '#10B981',
      onPress: () => router.push('/(tabs)/track'),
      badge: 'Live',
    },
    {
      icon: <User size={20} color={colors.primary} />,
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      color: colors.primary,
      onPress: () => router.push('/profile/personal-info'),
    },
    {
      icon: <MapPin size={20} color="#3B82F6" />,
      title: 'Delivery Addresses',
      subtitle: 'Manage your saved addresses',
      color: '#3B82F6',
      onPress: () => router.push('/profile/addresses'),
    },
    {
      icon: <CreditCard size={20} color="#8B5CF6" />,
      title: 'Payment Methods',
      subtitle: 'Manage cards and M-Pesa',
      color: '#8B5CF6',
      onPress: () => router.push('/profile/payment-methods'),
    },
    {
      icon: <Bell size={20} color="#F59E0B" />,
      title: 'Notifications',
      subtitle: 'Order updates and promotions',
      color: '#F59E0B',
      onPress: () => router.push('/profile/notifications'),
    },
    {
      icon: <Star size={20} color="#EF4444" />,
      title: 'Rate & Review',
      subtitle: 'Share your experience',
      color: '#EF4444',
      onPress: () => router.push('/profile/rate-review'),
    },
    {
      icon: <Gift size={20} color="#10B981" />,
      title: 'Referral Program',
      subtitle: 'Invite friends and earn rewards',
      color: '#10B981',
      onPress: () => router.push('/profile/referral'),
      badge: 'New',
    },
    {
      icon: <HelpCircle size={20} color="#6366F1" />,
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      color: '#6366F1',
      onPress: () => router.push('/profile/help-support'),
    },
    {
      icon: <Settings size={20} color={colors.textSecondary} />,
      title: 'About Us',
      subtitle: 'Learn more about Kleanly',
      color: colors.textSecondary,
      onPress: () => router.push('/profile/about'),
    },
  ];

  if (isAdmin) {
    menuItems.splice(3, 0, {
      icon: <BarChart3 size={20} color="#8B5CF6" />,
      title: 'Analytics Dashboard',
      subtitle: 'View business metrics and insights',
      color: '#8B5CF6',
      onPress: () => router.push('/analytics'),
      badge: 'Admin',
    });
  }


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Premium Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'F0', colors.primary + 'E6', colors.primary + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerOverlay} />
            <View style={styles.headerContent}>
              {/* Premium Badge */}
              <View style={styles.premiumBadgeContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                  style={styles.premiumBadge}
                >
                  <Crown size={16} color="#FFFFFF" />
                  <Text style={styles.premiumBadgeText}>PREMIUM MEMBER</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={styles.avatarText}>
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.avatarGlow} />
                  <View style={styles.avatarRing} />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {user?.email?.split('@')[0] || 'User'}
                  </Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                  <View style={styles.userStats}>
                    <View style={styles.statItem}>
                      <TrendingUp size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.statText}>Active</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Award size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.statText}>Verified</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Text style={[styles.quickStatsTitle, { color: colors.text }]}>
            Your Kleanly Journey
          </Text>
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={[colors.success + '15', colors.success + '08']}
              style={styles.statCard}
            >
              <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
                <ShoppingBag size={20} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Orders</Text>
            </LinearGradient>
            
            <LinearGradient
              colors={[colors.primary + '15', colors.primary + '08']}
              style={styles.statCard}
            >
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Star size={20} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>4.9</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
            </LinearGradient>
            
            <LinearGradient
              colors={[colors.warning + '15', colors.warning + '08']}
              style={styles.statCard}
            >
              <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
                <Gift size={20} color={colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>KSH 2.5K</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.text }]}>
            Account & Services
          </Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              activeOpacity={0.8}
              style={styles.menuItemWrapper}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFF']}
                style={styles.menuItemGradient}
              >
                <Card style={styles.menuItem}>
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuItemLeft}>
                      <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                        {item.icon}
                        <View style={[styles.iconGlow, { backgroundColor: item.color + '10' }]} />
                      </View>
                      <View style={styles.menuItemText}>
                        <View style={styles.menuItemTitleRow}>
                          <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                            {item.title}
                          </Text>
                          {item.badge && (
                            <View style={[
                              styles.menuBadge, 
                              { 
                                backgroundColor: item.badge === 'Admin' ? '#8B5CF6' : 
                                                item.badge === 'New' ? colors.success : 
                                                item.badge === 'Live' ? '#10B981' : colors.primary 
                              }
                            ]}>
                              <Text style={styles.menuBadgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.menuItemArrow, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={[styles.arrowText, { color: colors.primary }]}>→</Text>
                    </View>
                  </View>
                </Card>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <LinearGradient
            colors={['#FF6B6B', '#FF5252', '#F44336']}
            style={styles.logoutGradient}
          >
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.9}
            >
              <LogOut size={20} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Kleanly v1.0.0
          </Text>
          <Text style={[styles.appCopyright, { color: colors.textSecondary }]}>
            © 2024 Kleanly. All rights reserved.
          </Text>
        </View>

        {/* Info Modal */}
        <InfoModal
          visible={!!infoModal}
          title={infoModal?.title || ''}
          content={infoModal?.content || ''}
          onClose={() => setInfoModal(null)}
        />
      </ScrollView>
      
      {/* Floating WhatsApp Button */}
      <WhatsAppButton 
        phoneNumber="+254700000000" 
        message="Hello Kleanly! I need customer support." 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Styles
  profileHeader: {
    marginBottom: 32,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 20,
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
  premiumBadgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarGlow: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.15)',
    opacity: 0.6,
    zIndex: -1,
  },
  avatarRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: -1,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userEmail: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    fontWeight: '500',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  
  // Quick Stats Styles
  quickStats: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickStatsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Menu Styles
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  menuItemGradient: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  menuItemWrapper: {
    marginBottom: 16,
  },
  menuItem: {
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    position: 'relative',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
    zIndex: -1,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  menuItemSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuItemArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalGradient: {
    padding: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalButtonGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Logout Styles
  logoutSection: {
    padding: 20,
    marginBottom: 20,
  },
  logoutGradient: {
    borderRadius: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // App Info Styles
  appInfo: {
    alignItems: 'center',
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  appCopyright: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});