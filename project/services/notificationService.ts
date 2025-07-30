@@ .. @@
   async sendOrderAssignedNotification(orderId: string, driverName: string) {
     await this.sendLocalNotification({
       orderId,
       type: 'order_assigned',
       title: 'Driver Assigned! 🚚',
       body: `${driverName} has been assigned to your order and is on the way!`,
     });
   }
+
+  async sendOrderCreatedNotification(orderId: string, category: string) {
+    await this.sendLocalNotification({
+      orderId,
+      type: 'order_assigned',
+      title: 'Order Created! 📋',
+      body: `Your ${category.replace('-', ' ')} order has been placed successfully.`,
+    });
+  }
+
+  async sendPaymentConfirmationNotification(orderId: string, amount: number, method: string) {
+    await this.sendLocalNotification({
+      orderId,
+      type: 'order_assigned',
+      title: 'Payment Confirmed! 💳',
+      body: `Payment of KSH ${amount.toLocaleString()} via ${method} has been confirmed.`,
+    });
+  }