import React, { useState, useEffect } from 'react';
import './MyDataPage.css';

const BACKEND_URL = "/api/powerautomate";

const icons = {
  'personal': 'fa-user',
  'edu': 'fa-book-open',
  'experience': 'fa-star',
  'fin': 'fa-money-check-alt',
  'id': 'fa-id-card',
  'social': 'fa-share-alt'
};

export default function MyDataPage() {
  const [profileData, setProfileData] = useState({});
  const [activeAccordion, setActiveAccordion] = useState('personal');
  const [activeSubTab, setActiveSubTab] = useState('personal-details');
  const [topBarTitle, setTopBarTitle] = useState('Personal Data');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      if (!userEmail) return;
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getProfile", payload: { email: userEmail } })
      });
      let data = await response.json();
      if (Array.isArray(data)) {
        if (data.length === 0) return;
        data = data[0];
      }
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching data from Power Automate:", error);
    }
  };

  const handleSaveProfileData = async (payload) => {
    setIsSaving(true);
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "postProfile", payload: { email: localStorage.getItem("userEmail") || "", ...payload } })
      });
      if (response.ok) {
        alert("Data saved successfully to Power Automate!");
        setProfileData(prev => ({ ...prev, ...payload }));
      } else {
        alert("Failed to save data.");
      }
    } catch (error) {
      console.error("Error saving to Power Automate:", error);
      alert("Error connecting to backend.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAccordion = (viewPrefix, title) => {
    if (activeAccordion === viewPrefix) {
      setActiveAccordion('');
    } else {
      setActiveAccordion(viewPrefix);
      if (['experience', 'social'].includes(viewPrefix)) {
        setActiveSubTab(viewPrefix);
        setTopBarTitle(title);
      }
    }
  };

  const handleSubTabClick = (subTab, title, parentAccordion) => {
    setActiveSubTab(subTab);
    setTopBarTitle(title);
    if (parentAccordion) setActiveAccordion(parentAccordion);
  };

  const getTopBarIcon = () => {
    for (let key in icons) {
      if (activeSubTab.includes(key) || activeAccordion.includes(key)) {
        return icons[key];
      }
    }
    return 'fa-tag';
  };

  return (
    <div className="my-data-body">
      {/* Navbar */}
      <nav className="my-data-nav">
        <div className="nav-left">
          <i className="fas fa-bars hamburger"></i>
          <a href="/hrms_self_details-page" className="nav-logo">
            <div className="nav-logo-mark"><i className="fas fa-layer-group"></i></div>
            <span className="nav-logo-text">HRMS <span>Portal</span></span>
          </a>
        </div>
        <div className="nav-user-dropdown-container">
          <div className="nav-user" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
            <i className="fas fa-user-circle"></i>
          </div>
          <div className={`dropdown-menu ${userDropdownOpen ? 'show' : ''}`}>
            <a href="#"><i className="fas fa-info-circle"></i> About</a>
            <a href="#"><i className="fas fa-cog"></i> Settings</a>
            <a href="/hrms_self_details-page"><i className="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      </nav>

      <div className="app-body">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="profile-header">
            <div className="avatar-circle">
              <i className="fas fa-user"></i>
            </div>
            <div className="profile-name">{profileData.name || "Guest User"}</div>
          </div>
          <ul className="nav-list">
            <AccordionItem 
              id="personal" title="Personal Data" icon="fa-user-alt" 
              activeAccordion={activeAccordion} toggleAccordion={toggleAccordion}
            >
              <SubTab id="personal-details" title="Personal Details" activeSubTab={activeSubTab} onClick={() => handleSubTabClick('personal-details', 'Personal Data')} />
              <SubTab id="personal-address" title="Address Details" activeSubTab={activeSubTab} onClick={() => handleSubTabClick('personal-address', 'Address')} />
            </AccordionItem>

            <AccordionItem 
              id="edu" title="Education" icon="fa-book-open" 
              activeAccordion={activeAccordion} toggleAccordion={toggleAccordion}
            >
              <SubTab id="edu-ssc" title="SSC & Inter" activeSubTab={activeSubTab} onClick={() => handleSubTabClick('edu-ssc', 'SSC & Inter')} />
              <SubTab id="edu-ug" title="Under Graduation" activeSubTab={activeSubTab} onClick={() => handleSubTabClick('edu-ug', 'UG')} />
            </AccordionItem>

            <div className="nav-item-container">
              <div className={`nav-item ${activeAccordion === 'experience' ? 'active' : ''}`} onClick={() => toggleAccordion('experience', 'Experience')}>
                <div className="nav-item-left"><i className="fas fa-star"></i> Experience</div>
              </div>
            </div>

            <AccordionItem 
              id="fin" title="Financial" icon="fa-money-check-alt" 
              activeAccordion={activeAccordion} toggleAccordion={toggleAccordion}
            >
              <SubTab id="fin-bank" title="Bank Details" activeSubTab={activeSubTab} onClick={() => handleSubTabClick('fin-bank', 'Bank')} />
              <SubTab id="fin-pan" title="PAN Card" activeSubTab={activeSubTab} onClick={() => handleSubTabClick('fin-pan', 'PAN')} />
              <SubTab id="fin-salary" title="Salary" activeSubTab={activeSubTab} onClick={() => handleSubTabClick('fin-salary', 'Salary')} />
            </AccordionItem>

            <AccordionItem 
              id="id" title="ID Proof" icon="fa-id-card" 
              activeAccordion={activeAccordion} toggleAccordion={toggleAccordion}
            >
              <SubTab id="id-aadhar" title="Aadhar" activeSubTab={activeSubTab} onClick={() => handleSubTabClick('id-aadhar', 'Aadhar')} />
            </AccordionItem>

            <div className="nav-item-container">
              <div className={`nav-item ${activeAccordion === 'social' ? 'active' : ''}`} onClick={() => toggleAccordion('social', 'Social Media')}>
                <div className="nav-item-left"><i className="fas fa-share-alt"></i> Social Media</div>
              </div>
            </div>
          </ul>
        </div>

        {/* Main Wrapper */}
        <div className="main-wrapper">
          <div className="page-header-new">
            <div className="page-title-new">
              <h1><i className={`fas ${getTopBarIcon()}`}></i> <span>{topBarTitle}</span></h1>
              <p>View and manage your personal and professional information</p>
            </div>
            <button className="btn btn-cyan" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px', height: '38px' }}>
              <i className="fas fa-user-edit"></i> Update Profile
            </button>
          </div>

          <div className="content-area">
            {activeSubTab === 'personal-details' && <PersonalDetailsView profileData={profileData} onSave={handleSaveProfileData} isSaving={isSaving} />}
            {activeSubTab === 'personal-address' && <AddressView profileData={profileData} onSave={handleSaveProfileData} isSaving={isSaving} />}
            {activeSubTab === 'edu-ssc' && <EducationSSCView profileData={profileData} onSave={handleSaveProfileData} isSaving={isSaving} />}
            {activeSubTab === 'edu-ug' && <EducationUGView profileData={profileData} />}
            {activeSubTab === 'experience' && <ExperienceView profileData={profileData} />}
            {activeSubTab === 'fin-bank' && <div className="data-view-container active"><div className="data-card"><h2 className="section-title orange-border">Bank Details</h2><p style={{color:'#64748b'}}>No data available</p></div></div>}
            {activeSubTab === 'fin-pan' && <div className="data-view-container active"><div className="data-card"><h2 className="section-title orange-border">PAN Card</h2><p style={{color:'#64748b'}}>No data available</p></div></div>}
            {activeSubTab === 'fin-salary' && <div className="data-view-container active"><div className="data-card"><h2 className="section-title orange-border">Salary</h2><p style={{color:'#64748b'}}>No data available</p></div></div>}
            {activeSubTab === 'id-aadhar' && <IdProofView profileData={profileData} onSave={handleSaveProfileData} isSaving={isSaving} />}
            {activeSubTab === 'social' && <SocialMediaView profileData={profileData} onSave={handleSaveProfileData} isSaving={isSaving} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Helper Components ----------------

function AccordionItem({ id, title, icon, activeAccordion, toggleAccordion, children }) {
  const isExpanded = activeAccordion === id;
  return (
    <li className={`nav-item-container ${isExpanded ? 'expanded' : ''}`}>
      <div className={`nav-item ${isExpanded ? 'active' : ''}`} onClick={() => toggleAccordion(id, title)}>
        <div className="nav-item-left"><i className={`fas ${icon}`}></i> {title}</div>
      </div>
      <ul className="sub-menu">
        {children}
      </ul>
    </li>
  );
}

function SubTab({ id, title, activeSubTab, onClick }) {
  return (
    <li className={activeSubTab === id ? 'active' : ''} onClick={onClick}>{title}</li>
  );
}

// ---------------- View Components ----------------

function EditableCard({ title, icon, data, fields, onSave, isSaving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(fields.reduce((acc, field) => {
      acc[field.id] = data[field.id] || '';
      return acc;
    }, {}));
  }, [data, fields, isEditing]);

  const handleEditToggle = () => {
    if (isEditing) {
      onSave(formData);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className={icon ? "profile-card" : "data-card"}>
      {icon ? (
        <div className="profile-card-header">
          <div className="profile-card-title-group">
            <div className="profile-card-icon"><i className={`fas ${icon}`}></i></div>
            <div className="profile-card-title">{title}</div>
          </div>
          <button className={`profile-btn-outline ${isSaving ? 'saving' : ''}`} onClick={handleEditToggle} disabled={isSaving}>
            {isEditing ? <><i className="fas fa-save"></i> Save</> : <><i className="fas fa-pen"></i> Edit</>}
          </button>
        </div>
      ) : (
        <>
          <h2 className="section-title orange-border">{title}</h2>
          <button className="btn btn-orange btn-edit-abs" onClick={handleEditToggle} disabled={isSaving}>
            {isEditing ? <><i className="fas fa-save"></i> Save</> : <><i className="fas fa-edit"></i> Edit</>}
          </button>
        </>
      )}

      {icon ? (
        <div className="profile-body">
           <div className="profile-col">
              {fields.slice(0, Math.ceil(fields.length / 2)).map(field => (
                <div className="profile-info-row" key={field.id}>
                  <div className="profile-label"><i className={`fas ${field.icon}`}></i> {field.label}</div>
                  <span className="profile-separator">:</span>
                  <div className="profile-val">
                    {isEditing && field.editable !== false ? (
                      <input type="text" value={formData[field.id] || ''} onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} />
                    ) : (
                       formData[field.id] || data[field.id] || field.default || ''
                    )}
                  </div>
                </div>
              ))}
           </div>
           <div className="profile-col">
              {fields.slice(Math.ceil(fields.length / 2)).map(field => (
                <div className="profile-info-row" key={field.id}>
                  <div className="profile-label"><i className={`fas ${field.icon}`}></i> {field.label}</div>
                  <span className="profile-separator">:</span>
                  <div className="profile-val">
                    {isEditing && field.editable !== false ? (
                      <input type="text" value={formData[field.id] || ''} onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} />
                    ) : (
                       formData[field.id] || data[field.id] || field.default || ''
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="data-grid" style={{ marginBottom: '30px' }}>
          {fields.map(field => (
             <div className="data-row" key={field.id}>
               <span className="d-label">{field.label}:</span>
               <span className="d-value">
                 {isEditing && field.editable !== false ? (
                    <input type="text" value={formData[field.id] || ''} onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} />
                 ) : (
                    formData[field.id] || data[field.id] || field.default || ''
                 )}
               </span>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PersonalDetailsView({ profileData, onSave, isSaving }) {
  const profFields = [
    { id: 'name', label: 'Name', icon: 'fa-user' },
    { id: 'college', label: 'College', icon: 'fa-building' },
    { id: 'role', label: 'Designation', icon: 'fa-briefcase' },
    { id: 'prof-doj', label: 'Date of Joining', icon: 'fa-calendar-alt', default: '01 Jan 2023', editable: false },
    { id: 'prof-mobile', label: 'Mobile Number', icon: 'fa-mobile-alt' },
    { id: 'prof-email', label: 'Email ID', icon: 'fa-envelope' },
    { id: 'prof-staff-code', label: 'Staff Code', icon: 'fa-id-card', default: 'STF12345', editable: false },
    { id: 'prof-dept', label: 'Department', icon: 'fa-sitemap', default: 'IT Department', editable: false },
    { id: 'prof-staff-type', label: 'Staff Type', icon: 'fa-user-tag', default: 'Permanent', editable: false },
    { id: 'prof-alt-mobile', label: 'Alt Mobile Number', icon: 'fa-mobile-alt' },
    { id: 'prof-alt-email', label: 'Alt Email ID', icon: 'fa-envelope' },
  ];

  const persFields = [
    { id: 'pers-mother-tongue', label: 'Mother Tongue', icon: 'fa-language', default: 'Telugu' },
    { id: 'pers-dob', label: 'Date of Birth', icon: 'fa-calendar-alt' },
    { id: 'pers-caste', label: 'Caste', icon: 'fa-lock', default: 'OC' },
    { id: 'pers-religion', label: 'Religion', icon: 'fa-om', default: 'Hindu' },
    { id: 'pers-orig-dob', label: 'Original DOB', icon: 'fa-calendar-alt', default: '15 Aug 1995' },
    { id: 'pers-gender', label: 'Gender', icon: 'fa-venus-mars', default: 'Male' },
  ];

  return (
    <div className="data-view-container active">
      <EditableCard title="Professional" icon="fa-briefcase" data={profileData} fields={profFields} onSave={onSave} isSaving={isSaving} />
      <EditableCard title="Personal" icon="fa-user" data={profileData} fields={persFields} onSave={onSave} isSaving={isSaving} />
    </div>
  );
}

function AddressView({ profileData, onSave, isSaving }) {
  const permFields = [
    { id: 'addr-perm-door', label: 'Door no' },
    { id: 'addr-perm-street', label: 'Street' },
    { id: 'addr-perm-city', label: 'City' },
    { id: 'addr-perm-state', label: 'State' },
    { id: 'addr-perm-country', label: 'Country' },
    { id: 'addr-perm-zip', label: 'Zip Code' },
  ];
  
  const tempFields = [
    { id: 'addr-temp-door', label: 'Door no' },
    { id: 'addr-temp-street', label: 'Street' },
    { id: 'addr-temp-city', label: 'City' },
    { id: 'addr-temp-state', label: 'State' },
    { id: 'addr-temp-country', label: 'Country' },
    { id: 'addr-temp-zip', label: 'Zip Code' },
  ];

  return (
    <div className="data-view-container active">
      <EditableCard title="Permanent Address" data={profileData} fields={permFields} onSave={onSave} isSaving={isSaving} />
      <EditableCard title="Temporary Address" data={profileData} fields={tempFields} onSave={onSave} isSaving={isSaving} />
    </div>
  );
}

function EducationSSCView({ profileData, onSave, isSaving }) {
  const sscFields = [
    { id: 'ssc-year', label: 'Year of passing' },
    { id: 'ssc-inst', label: 'Institution' },
    { id: 'ssc-perc', label: 'Percentage' }
  ];

  const interFields = [
    { id: 'inter-year', label: 'Year of passing' },
    { id: 'inter-inst', label: 'Institution' },
    { id: 'inter-perc', label: 'Percentage' }
  ];

  return (
    <div className="data-view-container active">
      <EditableCard title="SSC" data={profileData} fields={sscFields} onSave={onSave} isSaving={isSaving} />
      <EditableCard title="Intermediate" data={profileData} fields={interFields} onSave={onSave} isSaving={isSaving} />
    </div>
  );
}

function EducationUGView() {
  return (
    <div className="data-view-container active">
      <div className="data-card">
        <h2 className="section-title orange-border">Under Graduation</h2>
        <div className="form-row">
          <div className="form-group"><div className="form-label">Course*:</div><input type="text" className="form-control" /></div>
          <div className="form-group"><div className="form-label">Year of passing*:</div><input type="text" className="form-control" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><div className="form-label">Institution*:</div><input type="text" className="form-control" /></div>
          <div className="form-group"><div className="form-label">Percentage*:</div><input type="text" className="form-control" /></div>
        </div>
        <div className="text-center"><button className="btn btn-cyan">ADD</button></div>
      </div>
      <div className="data-card">
        <h2 className="section-title text-center" style={{ border: 'none' }}>List of Under Graduation Courses</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>S.No</th><th>Course</th><th>Year of Passing</th><th>Institution</th><th>Percentage</th><th>Soft Copy</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No data available in table</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ExperienceView() {
  return (
    <div className="data-view-container active">
      <div className="data-card">
        <h2 className="section-title orange-border">Experience</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="form-row">
            <div className="form-group"><div className="form-label" style={{ width: '180px' }}>College/Organisation:</div><input type="text" className="form-control" /></div>
            <div className="form-group"><div className="form-label" style={{ width: '100px' }}>Experience:</div><input type="text" className="form-control readonly" disabled /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><div className="form-label" style={{ width: '180px' }}>From:</div><input type="text" className="form-control" /></div>
            <div className="form-group"><div className="form-label" style={{ width: '100px' }}>To:</div><input type="text" className="form-control" /></div>
          </div>
          <div className="text-center"><button className="btn btn-cyan">ADD</button></div>
        </div>
      </div>
      <div className="data-card">
        <h2 className="section-title text-center" style={{ border: 'none' }}>List of Experiences</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>S.No</th><th>College/Organisation</th><th>Experience</th><th>From</th><th>To</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No data available in table</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IdProofView({ profileData, onSave, isSaving }) {
  const [formData, setFormData] = useState({ 'id-aadhar-no': profileData['id-aadhar-no'] || '' });
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="data-view-container active">
      <div className="data-card">
        <h2 className="section-title orange-border">Aadhar Details</h2>
        <div className="form-row" style={{ marginTop: '30px' }}>
          <div className="form-label" style={{ width: '100px' }}>Aadhar No:</div>
          <div className="d-value">
            {isEditing ? (
              <input type="text" value={formData['id-aadhar-no']} onChange={e => setFormData({ 'id-aadhar-no': e.target.value })} />
            ) : (
              formData['id-aadhar-no'] || profileData['id-aadhar-no'] || ''
            )}
          </div>
        </div>
        <button className="btn btn-orange btn-edit-abs" onClick={() => {
          if (isEditing) onSave(formData);
          setIsEditing(!isEditing);
        }} disabled={isSaving}>
          {isEditing ? <><i className="fas fa-save"></i> Save</> : <><i className="fas fa-edit"></i> Edit</>}
        </button>
      </div>
    </div>
  );
}

function SocialMediaView({ profileData, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    'sm-wa': profileData['sm-wa'] || '',
    'sm-in': profileData['sm-in'] || ''
  });

  return (
    <div className="data-view-container active">
      <div className="data-card">
        <h2 className="section-title orange-border">Social Media Details</h2>
        <div className="form-row">
          <div className="form-label">Whatsapp</div>
          <div className="sm-input-wrapper">
            <div className="sm-input-icon"><i className="fab fa-whatsapp i-wa"></i></div>
            <input type="text" value={formData['sm-wa']} onChange={e => setFormData({ ...formData, 'sm-wa': e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-label">LinkedIn</div>
          <div className="sm-input-wrapper">
            <div className="sm-input-icon"><i className="fab fa-linkedin-in i-in"></i></div>
            <input type="text" value={formData['sm-in']} onChange={e => setFormData({ ...formData, 'sm-in': e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button className="btn btn-cyan" onClick={() => onSave(formData)} disabled={isSaving}>
            <i className="fas fa-save"></i> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
