<template>
  <div class="landing">
    <LandingNavbar />

    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg">
        <img src="/hero-bg.png" alt="" class="hero-img" />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Plataforma #1 de gestión para empresas argentinas
        </div>
        <h1>Gestioná tu empresa<br/><span class="gradient-text">con inteligencia.</span></h1>
        <p class="hero-sub">Facturación, stock, cuentas corrientes, cheques y más. Todo en un solo lugar, con la seguridad y potencia que tu negocio necesita.</p>
        <div class="hero-actions">
          <router-link to="/registro" class="cta-primary">
            Comenzar Gratis
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </router-link>
          <a href="#features" @click.prevent="scrollTo('features')" class="cta-secondary">Ver funcionalidades</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>500+</strong><span>Empresas</span></div>
          <div class="stat-sep"></div>
          <div class="stat"><strong>99.9%</strong><span>Uptime</span></div>
          <div class="stat-sep"></div>
          <div class="stat"><strong>24/7</strong><span>Soporte</span></div>
        </div>
      </div>
      <div class="hero-mockup">
        <img src="/dashboard-mockup.png" alt="Dashboard Contasoft ERP" />
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="section features-section">
      <div class="section-inner">
        <div class="section-header">
          <span class="section-tag">Funcionalidades</span>
          <h2>Todo lo que necesitás<br/><span class="gradient-text">para crecer.</span></h2>
          <p>Módulos integrados que trabajan juntos para simplificar tu operación diaria.</p>
        </div>
        <div class="features-grid">
          <div v-for="(f, i) in features" :key="i" class="feature-card">
            <div class="feature-icon" v-html="f.icon"></div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section steps-section">
      <div class="section-inner">
        <div class="section-header">
          <span class="section-tag">Cómo funciona</span>
          <h2>Empezá en <span class="gradient-text">3 pasos</span></h2>
        </div>
        <div class="steps-grid">
          <div v-for="(s, i) in steps" :key="i" class="step-card">
            <div class="step-number">{{ i + 1 }}</div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section id="pricing" class="section pricing-section">
      <div class="section-inner">
        <div class="section-header">
          <span class="section-tag">Planes</span>
          <h2>Simple y <span class="gradient-text">transparente</span></h2>
          <p>Un solo plan con todo incluido. Sin sorpresas.</p>
        </div>
        <div class="pricing-card">
          <div class="pricing-top">
            <h3>Plan Empresarial</h3>
            <div class="pricing-price">
              <span class="price-currency">ARS$</span>
              <span class="price-amount">14.990</span>
              <span class="price-period">/mes</span>
            </div>
            <p class="pricing-note">Facturación mensual · Cancelá cuando quieras</p>
          </div>
          <ul class="pricing-features">
            <li v-for="pf in pricingFeatures" :key="pf">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cs-success)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              {{ pf }}
            </li>
          </ul>
          <router-link to="/registro" class="cta-primary pricing-cta">Comenzar ahora</router-link>
        </div>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="section about-section">
      <div class="section-inner about-grid">
        <div class="about-image">
          <img src="/about-team.png" alt="Equipo JD Sistemas" />
        </div>
        <div class="about-content">
          <span class="section-tag">Sobre Nosotros</span>
          <h2>JD Sistemas<br/><span class="gradient-text">Informáticos</span></h2>
          <p>Somos una empresa argentina dedicada al desarrollo de soluciones tecnológicas para PyMEs. Desde nuestros inicios, trabajamos con pasión para crear herramientas que simplifiquen la gestión empresarial.</p>
          <p>Contasoft ERP nació de la necesidad real de nuestros clientes: un sistema integral, fácil de usar y accesible, que permita gestionar todas las áreas del negocio desde una única plataforma en la nube.</p>
          <div class="about-values">
            <div class="value"><strong>Innovación</strong><span>Tecnología de vanguardia</span></div>
            <div class="value"><strong>Seguridad</strong><span>Datos protegidos 24/7</span></div>
            <div class="value"><strong>Soporte</strong><span>Atención personalizada</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="landing-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <LogoContasoft :size="30" />
          <span class="footer-name">Contasoft <span>ERP</span></span>
        </div>
        <div class="footer-links">
          <a href="#features" @click.prevent="scrollTo('features')">Funcionalidades</a>
          <a href="#pricing" @click.prevent="scrollTo('pricing')">Planes</a>
          <a href="#about" @click.prevent="scrollTo('about')">Nosotros</a>
          <router-link to="/login">Iniciar Sesión</router-link>
        </div>
        <p class="footer-copy">© {{ currentYear }} JD Sistemas Informáticos. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LandingNavbar from '@/components/LandingNavbar.vue';
import LogoContasoft from '@/components/LogoContasoft.vue';

const currentYear = new Date().getFullYear();

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const features = [
  { title: 'Facturación Inteligente', desc: 'Creá facturas, presupuestos y notas de crédito en segundos con cálculos automáticos de IVA.', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
  { title: 'Control de Stock', desc: 'Seguimiento en tiempo real de inventario con alertas de stock mínimo y ajuste de precios masivo.', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
  { title: 'Cuentas Corrientes', desc: 'Gestión completa de saldos, pagos y deudas de clientes y proveedores con resúmenes automáticos.', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' },
  { title: 'Cartera de Cheques', desc: 'Control total de cheques recibidos: cartera, depositados, cobrados y rechazados, vinculados a clientes.', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>' },
  { title: 'Multi-Empresa', desc: 'Cada empresa tiene su propia base de datos aislada. Datos seguros y 100% independientes.', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  { title: 'Reportes y Análisis', desc: 'Dashboards con KPIs en tiempo real, exportación a Excel y PDF para tomar decisiones informadas.', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' }
];

const steps = [
  { title: 'Registrate', desc: 'Creá tu cuenta en segundos con verificación por email. Es gratis y no requiere tarjeta.' },
  { title: 'Configurá tu empresa', desc: 'Cargá los datos de tu empresa: razón social, CUIT, condición IVA. Todo listo en minutos.' },
  { title: 'Gestioná todo', desc: 'Empezá a facturar, controlar stock, gestionar clientes y llevar tus finanzas al día.' }
];

const pricingFeatures = [
  'Facturación ilimitada',
  'Control de stock completo',
  'Cuentas corrientes de clientes y proveedores',
  'Cartera de cheques con vinculación automática',
  'Gestión de usuarios con roles y permisos',
  'Remitos y traspasos',
  'Exportación a PDF y Excel',
  'Base de datos aislada por empresa',
  'Soporte técnico prioritario',
  'Actualizaciones automáticas'
];
</script>

<style scoped>
/* ============================================
   LANDING PAGE — Premium Design
   ============================================ */
.landing {
  background: #050816;
  color: #e2e8f0;
  overflow-x: hidden;
}

.gradient-text {
  background: var(--cs-gradient-brand);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section {
  padding: 100px 0;
  position: relative;
}

.section-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--cs-accent-400);
  margin-bottom: 12px;
  padding: 4px 14px;
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: var(--cs-radius-full);
  background: rgba(6, 182, 212, 0.06);
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 900;
  color: #ffffff;
  margin: 8px 0 16px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.section-header p {
  font-size: 1.05rem;
  color: rgba(148, 163, 184, 0.9);
  max-width: 500px;
  margin: 0 auto;
}

/* ---- HERO ---- */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 32px 60px;
  text-align: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(5,8,22,0.3) 0%, rgba(5,8,22,0.95) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 720px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cs-accent-400);
  padding: 6px 16px;
  border: 1px solid rgba(6,182,212,0.2);
  border-radius: var(--cs-radius-full);
  background: rgba(6,182,212,0.06);
  margin-bottom: 24px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cs-accent-400);
  animation: cs-pulse 2s ease infinite;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 20px;
}

.hero-sub {
  font-size: 1.1rem;
  color: rgba(148,163,184,0.9);
  max-width: 560px;
  margin: 0 auto 32px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 48px;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--cs-gradient-brand);
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 32px;
  border-radius: var(--cs-radius-lg);
  box-shadow: 0 4px 20px rgba(79,70,229,0.4);
  transition: all var(--cs-transition);
}
.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(79,70,229,0.5);
}

.cta-secondary {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 14px 24px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: var(--cs-radius-lg);
  transition: all var(--cs-transition);
}
.cta-secondary:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.25);
  color: #ffffff;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat strong {
  font-size: 1.5rem;
  font-weight: 900;
  color: #ffffff;
}
.stat span {
  font-size: 0.75rem;
  color: rgba(148,163,184,0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-sep {
  width: 1px;
  height: 30px;
  background: rgba(255,255,255,0.1);
}

.hero-mockup {
  position: relative;
  z-index: 1;
  margin-top: 48px;
  max-width: 900px;
  width: 100%;
}

.hero-mockup img {
  width: 100%;
  border-radius: var(--cs-radius-xl);
  box-shadow: 0 25px 80px rgba(79,70,229,0.2), 0 0 0 1px rgba(255,255,255,0.06);
}

/* ---- FEATURES ---- */
.features-section {
  background: linear-gradient(180deg, #050816 0%, #0a0e27 100%);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--cs-radius-xl);
  padding: 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.feature-card:hover {
  background: rgba(79,70,229,0.06);
  border-color: rgba(79,70,229,0.2);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.feature-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cs-gradient-brand);
  border-radius: var(--cs-radius-lg);
  margin-bottom: 20px;
  color: white;
}

.feature-card h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
}
.feature-card p {
  font-size: 0.85rem;
  color: rgba(148,163,184,0.8);
  line-height: 1.6;
}

/* ---- STEPS ---- */
.steps-section {
  background: #0a0e27;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  position: relative;
}

.step-card {
  text-align: center;
  padding: 40px 24px;
}

.step-number {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cs-gradient-brand);
  color: white;
  font-size: 1.3rem;
  font-weight: 900;
  border-radius: var(--cs-radius-lg);
  box-shadow: 0 8px 25px rgba(79,70,229,0.35);
}

.step-card h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
}
.step-card p {
  font-size: 0.85rem;
  color: rgba(148,163,184,0.7);
  line-height: 1.6;
}

/* ---- PRICING ---- */
.pricing-section {
  background: linear-gradient(180deg, #0a0e27 0%, #050816 100%);
}

.pricing-card {
  max-width: 480px;
  margin: 0 auto;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(79,70,229,0.25);
  border-radius: var(--cs-radius-2xl);
  padding: 48px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.pricing-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--cs-gradient-brand);
}

.pricing-top h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(148,163,184,0.8);
  margin-bottom: 16px;
}

.pricing-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}
.price-currency {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(148,163,184,0.6);
}
.price-amount {
  font-size: 3.5rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.03em;
}
.price-period {
  font-size: 1rem;
  color: rgba(148,163,184,0.5);
  font-weight: 500;
}

.pricing-note {
  font-size: 0.8rem;
  color: rgba(148,163,184,0.5);
  margin-bottom: 32px;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  text-align: left;
}
.pricing-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 0.88rem;
  color: rgba(226,232,240,0.85);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.pricing-cta {
  width: 100%;
  justify-content: center;
  padding: 16px;
  font-size: 1.05rem;
}

/* ---- ABOUT ---- */
.about-section {
  background: #050816;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.about-image img {
  width: 100%;
  border-radius: var(--cs-radius-xl);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.about-content .section-tag { margin-bottom: 12px; }

.about-content h2 {
  font-size: 2.2rem;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 20px;
  line-height: 1.2;
}

.about-content p {
  font-size: 0.95rem;
  color: rgba(148,163,184,0.8);
  line-height: 1.7;
  margin-bottom: 16px;
}

.about-values {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.value {
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--cs-radius-lg);
}
.value strong {
  display: block;
  font-size: 0.85rem;
  color: #ffffff;
  margin-bottom: 4px;
}
.value span {
  font-size: 0.72rem;
  color: rgba(148,163,184,0.6);
}

/* ---- FOOTER ---- */
.landing-footer {
  padding: 40px 32px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: #050816;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-name {
  font-weight: 800;
  color: #ffffff;
  font-size: 1rem;
}
.footer-name span {
  color: var(--cs-accent-400);
  font-weight: 600;
}

.footer-links {
  display: flex;
  gap: 24px;
}
.footer-links a {
  color: rgba(148,163,184,0.6);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: color var(--cs-transition-fast);
}
.footer-links a:hover { color: #ffffff; }

.footer-copy {
  font-size: 0.72rem;
  color: rgba(148,163,184,0.35);
  width: 100%;
  text-align: center;
  margin-top: 16px;
}

/* ---- RESPONSIVE ---- */
@media (max-width: 900px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .about-grid { grid-template-columns: 1fr; }
  .hero h1 { font-size: 2.5rem; }
  .section-header h2 { font-size: 2rem; }
}

@media (max-width: 600px) {
  .hero { padding: 100px 20px 40px; }
  .hero h1 { font-size: 2rem; }
  .hero-sub { font-size: 0.95rem; }
  .features-grid, .steps-grid { grid-template-columns: 1fr; }
  .hero-actions { flex-direction: column; width: 100%; }
  .cta-primary, .cta-secondary { width: 100%; text-align: center; justify-content: center; }
  .about-values { grid-template-columns: 1fr; }
  .pricing-card { padding: 32px 24px; }
  .price-amount { font-size: 2.5rem; }
  .footer-inner { flex-direction: column; text-align: center; }
  .footer-links { flex-wrap: wrap; justify-content: center; }
}
</style>
