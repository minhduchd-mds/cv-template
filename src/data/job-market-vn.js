// Curated, dated, source-backed Vietnam market snapshot.
// Listings are NOT a live feed and may expire; salary reports are NOT employer offers.
export const JOB_MARKET_AS_OF = '2026-10-08'

export const jobMarketSources = [
  { id: 'itviec-2026', name: 'ITviec', year: '2025–2026', url: 'https://itviec.com/report/vietnam-it-salary-and-recruitment-market', kind: 'salary-median', note: 'Trung vị theo nghề, triệu VNĐ/tháng; không phải lương tại công ty được liệt kê.' },
  { id: 'adecco-2026', name: 'Adecco', year: '2026', url: 'https://www.adecco.com/-/jssmedia/project/adecco/adeccovn/pdf/adecco-vietnam-salary-guide-2026.pdf', kind: 'salary-range', note: 'Khoảng gross/tháng, triệu VNĐ; phân theo Hà Nội/HCM và số năm kinh nghiệm. Trang 48.' },
]

export const salaryBenchmarks = [
  { id: 'ux', role: 'UI/UX Designer', group: 'Design', sourceId: 'adecco-2026', kind: 'range-gross', hanoi: { '1-5': [20,40], '5+': [40,80] }, hcm: { '1-5': [35,60], '5+': [60,100] }, skills: ['Design System','Figma','UX Research'] },
  { id: 'frontend', role: 'Front-end Developer', group: 'Engineering', sourceId: 'itviec-2026', kind: 'median', median: 34.8, experience: { '3-4':30.8,'5-8':41.8,'8+':46.3 }, skills: ['React','Vue','TypeScript'] },
  { id: 'backend', role: 'Back-end Developer', group: 'Engineering', sourceId: 'itviec-2026', kind: 'median', median: 37.8, experience: { '<1':12.4,'1-2':25.35,'3-4':30.1,'5-8':39.9,'8+':54.9 }, skills: ['API','Databases','Cloud'] },
  { id: 'fullstack', role: 'Full-stack Developer', group: 'Engineering', sourceId: 'itviec-2026', kind: 'median', median: 37.25, experience: { '<1':10.1,'1-2':20.35,'3-4':34.5,'5-8':41.8,'8+':44.8 }, skills: ['Frontend','Backend','Testing'] },
  { id: 'mobile', role: 'Mobile Developer', group: 'Engineering', sourceId: 'itviec-2026', kind: 'median', median: 36.85, experience: { '<1':14.15,'1-2':28.8,'3-4':29.05,'5-8':37.35,'8+':45.7 }, skills: ['iOS','Android','Performance'] },
  { id: 'pm', role: 'Product Owner / Product Manager', group: 'Product', sourceId: 'itviec-2026', kind: 'median', median: 50.1, experience: { '1-2':25.3,'3-4':42.7,'5-8':60.4,'8+':75 }, skills: ['Strategy','Prioritization','Metrics'] },
  { id: 'ba', role: 'Business Analyst', group: 'Product', sourceId: 'itviec-2026', kind: 'median', median: 30, experience: { '<1':12.2,'1-2':14,'3-4':28,'5-8':37.4,'8+':41.35 }, skills: ['Requirements','BPMN','Stakeholders'] },
  { id: 'data', role: 'Data Analyst / Data Scientist / BI', group: 'Data', sourceId: 'itviec-2026', kind: 'median', median: 40.65, experience: { '1-2':23.8,'5-8':42.5 }, skills: ['SQL','Python','BI'] },
  { id: 'data-engineer', role: 'Data Engineer', group: 'Data', sourceId: 'itviec-2026', kind: 'median', median: 41.3, experience: { '3-4':56.9 }, skills: ['ETL','Pipelines','Data Quality'] },
  { id: 'techlead', role: 'Tech Lead', group: 'Leadership', sourceId: 'itviec-2026', kind: 'median', median: 51.8, experience: { '1-2':45.3,'3-4':53.85,'8+':68.45 }, skills: ['Architecture','Team Leadership'] },
  { id: 'devops', role: 'DevOps / DevSecOps', group: 'Infrastructure', sourceId: 'adecco-2026', kind: 'range-gross', hanoi: { '1-5':[30,60],'5+':[45,90] }, hcm: { '1-5':[35,70],'5+':[70,135] }, skills: ['CI/CD','Cloud','Security'] },
  { id: 'ai-engineer', role: 'AI Engineer', group: 'AI', sourceId: 'adecco-2026', kind: 'range-gross', hanoi: { '1-5':[25,50],'5+':[50,100] }, hcm: { '1-5':[40,70],'5+':[70,100] }, skills: ['LLM','Python','Evaluation'] },
  { id: 'qa', role: 'QA / QC', group: 'Quality', sourceId: 'itviec-2026', kind: 'median', median: 31.2, experience: { '1-2':18,'3-4':24.4,'5-8':29.75,'8+':38.5 }, skills: ['Testing','Automation','Quality'] },
]

export const verifiedEmployers = [
  { id:'viettel', name:'Viettel', location:'Hà Nội · TP.HCM', category:'Telecom / Enterprise', careersUrl:'https://tuyendung.viettel.vn/recruitment-information/search?lstOrgId=++++++++++++++++++++++++++++++++++++148843', source:'Cổng tuyển dụng Viettel' },
  { id:'fpt-software', name:'FPT Software', location:'Hà Nội · TP.HCM · Đà Nẵng', category:'Software / Global IT', careersUrl:'https://career.fpt-software.com/jobs-search', source:'FPT Software Career Portal' },
  { id:'fpt-telecom', name:'FPT Telecom', location:'Toàn quốc', category:'Telecom / Digital', careersUrl:'https://fptjobs.com/', source:'FPT Jobs' },
  { id:'vng', name:'VNG', location:'Hà Nội · TP.HCM', category:'Technology / Fintech', careersUrl:'https://career.vng.com.vn/job-search', source:'VNG Careers' },
  { id:'momo', name:'MoMo', location:'Hà Nội · TP.HCM', category:'Fintech', careersUrl:'https://momo.careers/jobs-opening', source:'MoMo Careers' },
  { id:'fpt-education', name:'FPT Education', location:'Toàn quốc', category:'Education / Tech', careersUrl:'https://career.fpt.edu.vn/Job/Search', source:'FPT Education Careers' },
]

// Observed examples are NOT guaranteed to still be open; employer sites own availability.
// Never attach salaryBenchmarks to a specific employer as a salary offer.
export const observedJobSignals = [
  { id:'viettel-cloud', employerId:'viettel', title:'Chuyên viên Quản lý sản phẩm Cloud', location:'Hà Nội', roleId:'pm', sourceUrl:'https://tuyendung.viettel.vn/recruitment-information/search?checkOrg=1&keywords=&lstOrgId=++++++++++++++++++++++++++++++++++++9007544&recruitmentInfomationId=39151', checkedAt:JOB_MARKET_AS_OF, expiresAt:'2026-12-31', pay:'undisclosed' },
  { id:'viettel-software', employerId:'viettel', title:'Chuyên viên phát triển phần mềm', location:'Hà Nội', roleId:'backend', sourceUrl:'https://tuyendung.viettel.vn/recruitment-information/search?checkOrg=1&keywords=&lstOrgId=++++++++++++++++++++++++++++++++++++9007544&recruitmentInfomationId=39151', checkedAt:JOB_MARKET_AS_OF, expiresAt:'2026-12-31', pay:'undisclosed' },
  { id:'viettel-project', employerId:'viettel', title:'Chuyên viên Quản trị dự án', location:'Hà Nội', roleId:'pm', sourceUrl:'https://tuyendung.viettel.vn/recruitment-information/search?checkOrg=1&keywords=&lstOrgId=++++++++++++++++++++++++++++++++++++9007544&recruitmentInfomationId=39151', checkedAt:JOB_MARKET_AS_OF, expiresAt:'2026-11-30', pay:'undisclosed' },
  { id:'vng-ai', employerId:'vng', title:'AI Engineer · GreenNode', location:'TP.HCM', roleId:'ai-engineer', sourceUrl:'https://career.vng.com.vn/job-search', checkedAt:JOB_MARKET_AS_OF, pay:'undisclosed' },
  { id:'vng-ai-forward', employerId:'vng', title:'AI Engineer (Forward Deployed)', location:'Hà Nội', roleId:'ai-engineer', sourceUrl:'https://career.vng.com.vn/job-search', checkedAt:JOB_MARKET_AS_OF, pay:'undisclosed' },
  { id:'momo-product', employerId:'momo', title:'Lead · Product', location:'Toàn quốc', roleId:'pm', sourceUrl:'https://momo.careers/jobs-opening', checkedAt:JOB_MARKET_AS_OF, pay:'undisclosed' },
  { id:'momo-engineer', employerId:'momo', title:'Software Engineer II', location:'TP.HCM', roleId:'backend', sourceUrl:'https://momo.careers/jobs-opening', checkedAt:JOB_MARKET_AS_OF, pay:'undisclosed' },
  { id:'momo-security', employerId:'momo', title:'Senior · Security Engineer', location:'TP.HCM', roleId:'devops', sourceUrl:'https://momo.careers/jobs-opening', checkedAt:JOB_MARKET_AS_OF, pay:'undisclosed' },
  { id:'fpt-embedded', employerId:'fpt-software', title:'Embedded C Engineer', location:'Hà Nội · TP.HCM · Đà Nẵng', roleId:'backend', sourceUrl:'https://career.fpt-software.com/jobs-search', checkedAt:JOB_MARKET_AS_OF, pay:'undisclosed' },
  { id:'fpt-3d', employerId:'fpt-software', title:'Middle 3D Design Engineer (CATIA)', location:'Hà Nội', roleId:'ux', sourceUrl:'https://career.fpt-software.com/jobs-search', checkedAt:JOB_MARKET_AS_OF, pay:'undisclosed', note:'3D engineering; không phải UI/UX' },
]

export const isObservedJobCurrent = (job, date = JOB_MARKET_AS_OF) => !job.expiresAt || job.expiresAt >= date
export const jobSourceForRole = role => jobMarketSources.find(source => source.id === role?.sourceId)
export const salaryDisplay = (role, city = 'hanoi', years = '1-5') => {
  if (!role) return 'Chưa có dữ liệu'
  if (role.kind === 'median') {
    const value = Number(role.median)
    return Number.isFinite(value) ? value.toLocaleString('vi-VN') + ' tr/tháng · trung vị VN' : 'Chưa có dữ liệu'
  }
  const range = role[city]?.[years]
  return Array.isArray(range) && range.length === 2
    ? range[0] + '–' + range[1] + ' tr/tháng · gross'
    : 'Chưa có dữ liệu'
}
