import { Layout, Menu, Typography } from 'antd';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import KeycapFormPage from './pages/KeycapFormPage';
import KeycapListPage from './pages/KeycapListPage';
import WishlistFormPage from './pages/WishlistFormPage';
import WishlistListPage from './pages/WishlistListPage';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {
  const location = useLocation();

  const selectedKey = location.pathname.startsWith('/wishlists')
    ? '/wishlists'
    : '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: '#001529',
          paddingInline: 24,
        }}
      >
        <Title level={4} style={{ color: '#fff', margin: 0, flexShrink: 0 }}>
          <Link to="/" style={{ color: 'inherit' }}>
            键帽配色收藏册
          </Link>
        </Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{ background: 'transparent', borderBottom: 'none', flex: 1 }}
        >
          <Menu.Item key="/">
            <Link to="/">键帽收藏</Link>
          </Menu.Item>
          <Menu.Item key="/wishlists">
            <Link to="/wishlists">心愿单</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/" element={<KeycapListPage />} />
          <Route path="/keycaps/new" element={<KeycapFormPage />} />
          <Route path="/keycaps/:id/edit" element={<KeycapFormPage />} />
          <Route path="/wishlists" element={<WishlistListPage />} />
          <Route path="/wishlists/new" element={<WishlistFormPage />} />
          <Route path="/wishlists/:id/edit" element={<WishlistFormPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}
