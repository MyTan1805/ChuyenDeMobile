import { registerRootComponent } from 'expo';
import App from '@/App';

// registerRootComponent sẽ tự động gọi AppRegistry.registerComponent('main', () => App)
registerRootComponent(App);