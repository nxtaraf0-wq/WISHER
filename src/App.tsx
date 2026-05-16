/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateWish from './components/CreateWish';
import ViewWish from './components/ViewWish';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateWish />} />
        <Route path="/w/:encoded" element={<ViewWish />} />
      </Routes>
    </BrowserRouter>
  );
}
