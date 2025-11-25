import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const iconMapping = {
    'Trang chủ': 'home-outline',
    'Cộng đồng': 'people-outline',
    'Đăng tin': 'add-circle', // Icon này sẽ được xử lý đặc biệt
    'Cửa hàng': 'cart-outline',
    'Hồ sơ': 'person-circle-outline',
  };
  

  const focusedIconMapping = {
    'Trang chủ': 'home',
    'Cộng đồng': 'people',
    'Đăng tin': 'add-circle',
    'Cửa hàng': 'cart',
    'Hồ sơ': 'person-circle',
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // --- BẮT ĐẦU THAY ĐỔI LOGIC CHO NÚT "ĐĂNG TIN" ---
        if (label === 'Đăng tin') {
          return (
            <TouchableOpacity key={index} onPress={onPress} style={styles.middleTabButton}>
              <View style={styles.middleIconContainer}>
                <Ionicons name={focusedIconMapping[label]} size={48} color="white" />
              </View>
              {/* Chúng ta vẫn có thể hiển thị text nếu muốn, nhưng thường thì nút giữa sẽ không có text */}
              {/* <Text style={{ color: isFocused ? '#4CAF50' : '#888888', fontSize: 12, marginTop: 4 }}>{label}</Text> */}
            </TouchableOpacity>
          );
        }
        // --- KẾT THÚC THAY ĐỔI LOGIC ---

        const iconName = isFocused ? focusedIconMapping[label] : iconMapping[label];
        const color = isFocused ? '#4CAF50' : '#888888';

        return (
          <TouchableOpacity key={index} onPress={onPress} style={styles.tabButton}>
            <Ionicons name={iconName} size={28} color={color} />
            <Text style={{ color, fontSize: 12, marginTop: 4 }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 85,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 20,
    alignItems: 'center', // Căn các tab button vào giữa theo chiều dọc
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10, // Thêm padding để đẩy nội dung xuống một chút
  },
  // --- STYLE MỚI CHO NÚT Ở GIỮA ---
  middleTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50', // Màu xanh lá cây
    justifyContent: 'center',
    alignItems: 'center',
    // Thêm bóng đổ cho đẹp
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CustomTabBar;