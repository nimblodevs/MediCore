import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import PatientRegistration from './pages/Patient/RegistrationForm.jsx'
import DebtorsPage from './pages/Debtors/DebtorsPage.jsx'


const HMS = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const showPatientRegistration = activeSection === 'patient-registration'
  const showDebtorsPage = activeSection === 'debtors'

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="hidden lg:block">
        <Sidebar currentKey={activeSection} onNavigate={setActiveSection} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-[min(18rem,85vw)]">
            <Sidebar
              currentKey={activeSection}
              isMobile
              onClose={() => setSidebarOpen(false)}
              onNavigate={setActiveSection}
            />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <Navbar
          activeSection={activeSection}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <section className="p-4 sm:p-6">
          {showPatientRegistration ? (
            <PatientRegistration />
          ) : showDebtorsPage ? (
            <DebtorsPage />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                Current section
              </p>
              <h1 className="mt-2 text-2xl font-semibold capitalize text-slate-950">
                {activeSection}
              </h1>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default HMS
