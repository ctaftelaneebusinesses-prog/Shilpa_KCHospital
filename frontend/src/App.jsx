import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./LanguageContext";
import { useReveal } from "./hooks/useReveal";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Appointment from "./components/Appointment";
import Location from "./components/Location";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import MobileBottomBar from "./components/MobileBottomBar";
import AdminApp from "./admin/AdminApp";

function Page() {
  useReveal();

  return (
    <>
      <Header />
      <Hero />
      <About />
      <Services />
      <Appointment />
      <Location />
      <Footer />
      <FloatingWhatsApp />
      <MobileBottomBar />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/*"
          element={
            <LanguageProvider>
              <Page />
            </LanguageProvider>
          }
        />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}
