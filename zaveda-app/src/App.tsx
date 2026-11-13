
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
const sections = [
  'Dashboard',
  'Bookings',
  'Customers',
  'Therapists',
  'Billing',
  'Branches',
  'Memberships',
  'Expenses',
  'Inventory',
  'Reports'
]

const bookings = [
  { name: 'Customer 1', service: 'Ayurvedic Massage', time: '10:00 AM', status: 'Confirmed', paymentStatus: 'Unpaid' },
  { name: 'Customer 2', service: 'Body Massage', time: '12:00 PM', status: 'Pending', paymentStatus: 'Unpaid' },
  { name: 'Customer 3', service: 'Foot Reflexology', time: '03:00 PM', status: 'Confirmed', paymentStatus: 'Unpaid' }
]

function App() {
  const [page, setPage] = useState('Dashboard')
  const [branch, setBranch] = useState('Main Branch')
  
  const [bookingList, setBookingList] = useState<typeof bookings>([])
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('Ayurvedic Massage')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
const [paymentStatus, setPaymentStatus] = useState('Unpaid')
const [loginEmail, setLoginEmail] = useState('')
const [loginPassword, setLoginPassword] = useState('')
const [isLoggedIn, setIsLoggedIn] = useState(false)
  
const [serviceOptions, setServiceOptions] = useState<string[]>([])

useEffect(() => {
  if (!isLoggedIn) return

    const loadBookings = async () => {
        const { data, error } = await supabase
              .from('appointments')
.select('*, customers(*), services(*)')
                          .order('created_at', { ascending: false })

                              if (error) {
                                    alert('Booking loading error: ' + error.message)
                                          return
                                              }

                                                  const savedBookings = (data ?? []).map((item: any) => ({
                                                        name: item.customers?.full_name
                                                                ?? item.customers?.name
                                                                        ?? 'Customer',
                                                                              service: item.services?.service_name
                                                                                      ?? 'Service',
                                                                                            time: item.appointment_time ?? '',
                                                                                                  status: item.status ?? 'Pending',
                                                                                                        paymentStatus: item.payment_status ?? 'Unpaid'
                                                                                                            }))

                                                                                                                setBookingList(savedBookings)
                                                                                                                  }

                                                                                                                    loadBookings()
                                                                                                                    }, [isLoggedIn])
                                                                                                                    
useEffect(() => {
  const loadServices = async () => {
      const { data, error } = await supabase
            .from('services')
                  .select('service_name')
                        .order('service_name')
                        
                            if (error) {
                                  alert('Service loading error: ' + error.message)
                                        return
                                            }
                                            
                                                setServiceOptions((data ?? []).map(item => item.service_name))
    
                                                alert('Services loaded: ' + (data?.length ?? 0))
                                                
                                              }
                                                  
                                                    loadServices()
                                                    }, [])
                                                    const money = (amount: number) =>
    '₹' + amount.toLocaleString('en-IN')
useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setIsLoggedIn(Boolean(data.user))
          })
          }, [])
const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
            password: loginPassword,
              })

                if (error) {
                    alert(error.message)
                        return
                          }

                            setIsLoggedIn(true)
                          }                          
if (!isLoggedIn) {
    return (
        <div style={{
              minHeight: '100vh',
                    background: '#073b34',
                          color: 'white',
                                padding: '40px 20px',
                                      textAlign: 'center'
                                          }}>
                                                <h1>ZAVEDA</h1>
                                                      <h3>Wellness Spa Management Login</h3>

                                                            <input
                                                                    type="email"
                                                                            placeholder="Email"
                                                                                    value={loginEmail}
                                                                                            onChange={(e) => setLoginEmail(e.target.value)}
                                                                                                  />

                                                                                                        <input
                                                                                                                type="password"
                                                                                                                        placeholder="Password"
                                                                                                                                value={loginPassword}
                                                                                                                                        onChange={(e) => setLoginPassword(e.target.value)}
                                                                                                                                              />

                                                                                                                                                    <button onClick={handleLogin}>
                                                                                                                                                            Login
                                                                                                                                                                  </button>
                                                                                                                                                                      </div>
                                                                                                                                                                        )
                                                                                                                                                                        }

  const card = (label: string, value: string, color = '#c5a46d') => (
    <div className="card">
      <p className="muted">{label}</p>
      <h2 style={{ color }}>{value}</h2>
    </div>
  )
const handleAddBooking = async () => {
  if (!customerName || !phone || !date || !time) {
      alert('Please fill all booking details')
          return
            }

            const { data: selectedService, error: serviceError } = await supabase
              .from('services')
                .select('id, price')
                  .ilike('service_name', service.trim())
                    .maybeSingle()

                    if (serviceError || !selectedService) {
                      
                      alert(serviceError ? 'Supabase error: ' + serviceError.message : 'Service not found: ' + service)

                        return
                        }

                        const { data: existingCustomer, error: findError } = await supabase
                          .from('customers')
                            .select('id')
                              .eq('phone', phone)
                                .maybeSingle()

                                if (findError) {
                                  alert(findError.message)
                                    return
                                    }

                                    let customerId = existingCustomer?.id

                                    if (!customerId) {
                                      const { data: newCustomer, error: saveError } = await supabase
                                          .from('customers')
                                              .insert({ full_name: customerName, phone })
                                                  .select('id')
                                                      .single()

                                                        if (saveError) {
                                                            alert(saveError.message)
                                                                return
                                                                  }

                                                                    customerId = newCustomer.id
                                                                    }

                                                                    console.log('Customer ID:', customerId)
                                       
const { error: bookingError } = await supabase
  .from('appointments')
  .insert({
    customer_id: customerId,
    service_id: selectedService.id,
    branch_id: 1,
    appointment_date: date,
    appointment_time: time,
    total_amount: selectedService.price,
    amount_paid: 0,
    payment_status: 'Unpaid',
    status: 'Confirmed'
  })

if (bookingError) {
  alert('Booking save failed: ' + bookingError.message)
  return
}
                             
              setBookingList([
                  ...bookingList,
                      {
                            name: customerName,
                                  service,
                                        time,
                                              status: 'Confirmed',
                                            paymentStatus: paymentStatus
                                                  }
                                                    ])

                                                      setCustomerName('')
                                                        setPhone('')
                                                          setDate('')
                                                            setTime('')
                                                              alert('Booking added successfully!')
                                                  }                                                            
  return (
    <div className="app">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #101b18; color: #f5f0e6;
          font-family: Arial, sans-serif; }
        .app { min-height: 100vh; background: #101b18; }
        header { padding: 20px; background: #172923;
          border-bottom: 1px solid #b99a64; }
        .brand { color: #d5b77e; font-size: 27px;
          font-weight: bold; letter-spacing: 3px; }
        .muted { color: #a8b2aa; font-size: 14px; }
        .layout { display: flex; min-height: 85vh; }
        nav { width: 210px; padding: 15px;
          background: #14231e; }
        nav button { display: block; width: 100%; text-align: left;
          padding: 13px; margin: 4px 0; background: transparent;
          color: #eee; border: 0; border-radius: 7px; font-size: 14px; }
        nav button.active, nav button:hover {
          background: #b99a64; color: #14231e; }
        main { flex: 1; padding: 24px; min-width: 0; }
        .cards { display: grid;
          grid-template-columns: repeat(auto-fit,minmax(160px,1fr));
          gap: 15px; margin: 20px 0; }
        .card, .panel { background: #1c3028; padding: 18px;
          border: 1px solid #34483d; border-radius: 10px; }
        .card h2 { font-size: 25px; margin: 10px 0; }
        .panel { margin-top: 20px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse;
          min-width: 450px; }
        th, td { text-align: left; padding: 13px;
          border-bottom: 1px solid #405047; font-size: 14px; }
        th { color: #d5b77e; }
        input, select { padding: 12px; border-radius: 6px;
          border: 1px solid #8e9b91; background: #172923;
          color: white; margin: 5px; max-width: 100%; }
        .gold { background: #b99a64; color: #17231d;
          border: 0; padding: 12px 18px; border-radius: 7px;
          font-weight: bold; margin: 5px; }
        .tag { color: #d5b77e; }
        @media(max-width:650px) {
          .layout { display: block; }
          nav { width: 100%; display: flex; overflow-x: auto;
            gap: 5px; }
          nav button { min-width: 115px; text-align: center; }
          main { padding: 15px; }
        }
      `}</style>

      <header>
        <div className="brand">ZAVEDA</div>
        <p className="muted">WELLNESS SPA MANAGEMENT SYSTEM</p>
        <select value={branch}
          onChange={e => setBranch(e.target.value)}>
          <option>Main Branch</option>
          <option>Branch 2</option>
          <option>Branch 3</option>
        </select>
      </header>

      <div className="layout">
        <nav>
          {sections.map(item => (
            <button key={item}
              className={page === item ? 'active' : ''}
              onClick={() => setPage(item)}>
              {item}
            </button>
          ))}
        </nav>
<main>

          <h1>{page}</h1>
          <p className="muted">{branch} · Welcome to Zaveda</p>

          {page === 'Dashboard' && <>
            <div className="cards">
              {card('Today Bookings', '12')}
              {card('Today Revenue', money(18500))}
              {card('Total Customers', '248')}
              {card('Available Therapists', '6')}
            </div>
            <div className="panel">
              <h3>Today's Appointments</h3>
              <BookingTable bookings={bookingList} />
            </div>
            <div className="panel">
              <h3>Quick Actions</h3>
              <button className="gold"
                onClick={() => setPage('Bookings')}>New Booking</button>
              <button className="gold"
                onClick={() => setPage('Customers')}>Add Customer</button>
              <button className="gold"
                onClick={() => setPage('Billing')}>Create Bill</button>
            </div>
          </>}

{page === 'Bookings' && (
    <div className="panel">
        <h3>Appointment Management</h3>

            <input
                  placeholder="Customer name"
                        value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                                  />

                                      <input
                                            placeholder="Phone number"
                                                  value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                            />

                                                                <select
                                                                      value={service}
                                                                            onChange={(e) => setService(e.target.value)}
                                                                                >
                                                                                      
                                                                                      {serviceOptions.map((name) => (
                                                                                        <option key={name} value={name}>
                                                                                            {name}
                                                                                              </option>
                                                                                              ))}
                                                                                              
                                                                                                            </select>

                                                                                                                <input
                                                                                                                      type="date"
                                                                                                                            value={date}
                                                                                                                                  onChange={(e) => setDate(e.target.value)}
                                                                                                                                      />

                                                                                                                                          <input
                                                                                                                                                type="time"
                                                                                                                                                      value={time}
                                                                                                                                                            onChange={(e) => setTime(e.target.value)}
                                                                                                                                                                />
<select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
      <option>Unpaid</option>
        <option>Paid</option>
          <option>Partial Payment</option>
          </select>
                                                                                                                                                                    <button className="gold" onClick={handleAddBooking}>
                                                                                                                                                                          Add Booking
                                                                                                                                                                              </button>

                                                                                                                                                                              <BookingTable bookings={bookingList} />
                                                                                                                                                                                    </div>
                                                                                                                                                                                    )}


          {page === 'Customers' && <div className="panel">
            <h3>Customer Records</h3>
            <input placeholder="Customer name" />
            <input placeholder="Mobile number" />
     <button className="gold">        
              Add Customer
            </button>
          </div>}

          {page === 'Therapists' && <div className="panel">
            <h3>Therapist Management</h3>
            <input placeholder="Therapist name" />
            <input placeholder="Phone number" />
            <input placeholder="Specialization" />
            <button className="gold"
              onClick={() => alert('Therapist form ready for setup')}>
              Add Therapist
            </button>
          </div>}

          {page === 'Billing' && <div className="panel">
            <h3>Billing & Invoices</h3>
            <input placeholder="Customer name" />
            <input placeholder="Service name" />
            <input type="number" placeholder="Amount in ₹" />
            <button className="gold"
              onClick={() => alert('Billing form ready for setup')}>
              Create Invoice
            </button>
            <p className="muted">GST invoice configuration can be added next.</p>
          </div>}

          {page === 'Branches' && <div className="panel">
            <h3>Branch Management</h3>
            <p>Main Branch</p>
            <p>Branch 2</p>
            <p>Branch 3</p>
            <input placeholder="New branch name" />
            <button className="gold"
              onClick={() => alert('Branch form ready for setup')}>
              Add Branch
            </button>
          </div>}

          {page === 'Memberships' && <div className="panel">
            <h3>Membership Plans</h3>
            <p>Silver · Gold · Platinum</p>
            <input placeholder="Member name" />
            <select><option>Select Plan</option>
              <option>Silver</option>
              <option>Gold</option>
              <option>Platinum</option>
            </select>
            <button className="gold"
              onClick={() => alert('Membership form ready for setup')}>
              Add Membership
            </button>
          </div>}

          {page === 'Expenses' && <div className="panel">
            <h3>Expense Management</h3>
            <input placeholder="Expense description" />
            <input type="number" placeholder="Amount ₹" />
            <input type="date" />
            <button className="gold"
              onClick={() => alert('Expense form ready for setup')}>
              Add Expense
            </button>
          </div>}

          {page === 'Inventory' && <div className="panel">
            <h3>Stock Management</h3>
            <input placeholder="Product name" />
            <input type="number" placeholder="Quantity" />
            <input type="number" placeholder="Price ₹" />
            <button className="gold"
              onClick={() => alert('Inventory form ready for setup')}>
              Add Product
            </button>
          </div>}

          {page === 'Reports' && <div className="panel">
            <h3>Business Reports</h3>
            <p>Revenue overview</p>
            <h2 className="tag">{money(18500)}</h2>
            <p>Bookings: 12</p>
            <p>Expenses: {money(4500)}</p>
            <p>Estimated balance: {money(14000)}</p>
          </div>}

          <p className="muted">
            © Zaveda Wellness Spa · Management Dashboard
          </p>
        </main>
      </div>
    </div>
  )
}

function BookingTable({ bookings }: { bookings: any[] }) {


  return (
    <table>
      <thead>
        <tr><th>Customer</th><th>Service</th><th>Time</th>
                <th>Status</th><th>Payment Status</th></tr>
      </thead>
      <tbody>
        {bookings.map((b, i) => (
          <tr key={i}>
            <td>{b.name}</td><td>{b.service}</td>
            <td>{b.time}</td><td>{b.status}</td><td>{b.paymentStatus || 'Unpaid'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default App
