// Author-created Vietnam-centric practice simulations, not transcripts of real
// employers or verified questions asked by a specific recruiting team.
const prompts = (scenarioId, pack, questions) => questions.map(([question, why, framework, followUp], index) => ({
  id: 'scenario-' + scenarioId + '-' + (index + 1),
  scenarioId,
  pack,
  category: index === 0 ? 'core' : index === 4 ? 'challenge' : 'behavioral',
  provenance: 'simulation-authored',
  question,
  why,
  framework,
  example: 'Đưa ví dụ thật từ CV: bối cảnh, phần trực tiếp làm, quyết định, bằng chứng và kết quả.',
  followUps: [followUp],
  avoid: ['Nói chung chung', 'Nhận công lao của cả nhóm', 'Không chứng minh được số liệu'],
}))

export const interviewScenarios = [
  {
    id: 'hr-screening', icon: '01', label: 'Sàng lọc HR', group: 'Tuyển dụng',
    level: 'Cơ bản', time: '8–12 phút', stageId: 'hr', interviewerMode: 'recruiter', pressureLevel: 'supportive',
    context: 'Phỏng vấn lần đầu: động lực, kinh nghiệm và kỳ vọng.',
    skills: ['Giới thiệu','Động lực','Phù hợp'],
    questions: prompts('hr-screening', 'general', [
      ['Anh/chị giới thiệu bản thân trong 60 giây như thế nào?', 'Đánh giá mức liên quan tới vị trí.', ['Vai trò gần đây','Kết quả nổi bật','Lý do ứng tuyển'], 'Điểm mạnh nào thể hiện rõ nhất qua dự án?'],
      ['Điều gì khiến anh/chị muốn chuyển công việc hiện tại?', 'Đánh giá động lực và sự chuyên nghiệp.', ['Mục tiêu nghề nghiệp','Điều muốn học','Giá trị mang lại'], 'Nếu công việc mới có cùng khó khăn, anh/chị xử lý ra sao?'],
      ['Tại sao anh/chị chọn vị trí và công ty này?', 'Đánh giá mức tìm hiểu.', ['Hiểu sản phẩm','Yêu cầu phù hợp','Đóng góp cụ thể'], 'Anh/chị đã tìm hiểu sản phẩm nào của chúng tôi?'],
      ['Điểm mạnh và điểm cần cải thiện của anh/chị là gì?', 'Đánh giá tự nhận thức.', ['Điểm mạnh kèm bằng chứng','Điểm yếu thực tế','Cách khắc phục'], 'Có trường hợp nào việc đó ảnh hưởng tiến độ không?'],
      ['Anh/chị muốn hỏi nhà tuyển dụng điều gì trước khi kết thúc?', 'Đánh giá tư duy hai chiều.', ['Mục tiêu 90 ngày','Cách làm việc','Tiêu chí thành công'], 'Điều nào trong mô tả công việc cần làm rõ nhất?'],
    ]),
  },
  {
    id: 'ux-portfolio', icon: '02', label: 'Bảo vệ Portfolio', group: 'UI/UX',
    level: 'Chuyên sâu', time: '12–18 phút', stageId: 'portfolio', interviewerMode: 'craft', pressureLevel: 'realistic',
    context: 'Trình bày case study trước Design Lead với câu hỏi đào sâu quyết định.',
    skills: ['Problem framing','Research','Impact'],
    questions: prompts('ux-portfolio', 'design', [
      ['Hãy giới thiệu case study mà anh/chị trực tiếp chịu trách nhiệm.', 'Đánh giá ownership.', ['Bài toán','Phạm vi','Vai trò'], 'Ai chịu trách nhiệm cho phần research và handoff?'],
      ['Tại sao anh/chị chọn giải pháp này thay vì các phương án khác?', 'Đánh giá quyết định thiết kế.', ['Constraints','Các phương án','Trade-off'], 'Dữ liệu nào khiến anh/chị bỏ phương án ban đầu?'],
      ['Anh/chị kiểm chứng thiết kế với người dùng như thế nào?', 'Đánh giá research và validation.', ['Phương pháp','Mẫu','Insight','Thay đổi'], 'Nếu mẫu nghiên cứu nhỏ, anh/chị xử lý bias ra sao?'],
      ['Có lần nào Product Owner hoặc Developer phản đối thiết kế của anh/chị?', 'Đánh giá phối hợp stakeholder.', ['Xung đột','Trao đổi','Thử nghiệm','Kết quả'], 'Điều gì anh/chị đồng ý thay đổi sau phản hồi?'],
      ['Anh/chị chứng minh tác động của case study bằng chỉ số gì?', 'Đánh giá impact và attribution.', ['Baseline','Metric','Đo lường','Giới hạn'], 'Làm sao biết cải thiện đến từ thiết kế chứ không phải yếu tố khác?'],
    ]),
  },
  {
    id: 'design-system', icon: '03', label: 'Design System Review', group: 'UI/UX',
    level: 'Senior / Lead', time: '12–18 phút', stageId: 'technical', interviewerMode: 'craft', pressureLevel: 'pressure',
    context: 'Thẩm định kiến trúc component, tokens, governance và rollout đa sản phẩm.',
    skills: ['Tokens','Components','Governance'],
    questions: prompts('design-system', 'design', [
      ['Anh/chị bắt đầu xây Design System từ vấn đề nào và chọn phạm vi ban đầu ra sao?', 'Đánh giá chiến lược triển khai.', ['Audit','Ưu tiên','Phạm vi','Stakeholder'], 'Nếu chỉ có hai tuần, anh/chị ưu tiên gì?'],
      ['Anh/chị thiết kế token nhiều theme, density và responsive ra sao?', 'Đánh giá tổ chức token.', ['Semantic tokens','Variants','Breakpoints','Naming'], 'Anh/chị xử lý token trùng và breaking changes thế nào?'],
      ['Làm thế nào bảo đảm Figma và component React/Vue không lệch nhau?', 'Đánh giá design-to-code consistency.', ['Contract','Sync','QA','Versioning'], 'Ai sở hữu source of truth?'],
      ['Khi 10 đội sản phẩm không thống nhất chuẩn UI, anh/chị giải quyết thế nào?', 'Đánh giá governance.', ['Adoption','Exception process','Decision','Measurement'], 'Khi nào cho phép component ngoại lệ?'],
      ['Chỉ số nào chứng minh Design System hiệu quả?', 'Đánh giá impact.', ['Baseline','Adoption','Bug rate','Handoff'], 'Nếu tốc độ ban đầu giảm, anh/chị giải thích thế nào?'],
    ]),
  },
  {
    id: 'salary-offer', icon: '04', label: 'Đàm phán lương', group: 'Tuyển dụng',
    level: 'Thực tế', time: '8–12 phút', stageId: 'final', interviewerMode: 'recruiter', pressureLevel: 'realistic',
    context: 'HR hỏi kỳ vọng, cơ cấu gross/net, thử việc và offer cạnh tranh.',
    skills: ['Salary range','Gross/Net','Negotiation'],
    questions: prompts('salary-offer', 'general', [
      ['Mức thu nhập mong muốn của anh/chị là bao nhiêu, gross hay net?', 'Kiểm tra sự rõ ràng.', ['Khoảng phù hợp','Gross/net','Cơ sở đánh giá'], 'Nếu total package khác lương cơ bản thì sao?'],
      ['Vì sao anh/chị đưa ra mức kỳ vọng này?', 'Đánh giá giá trị và căn cứ thị trường.', ['Kinh nghiệm','Impact','Benchmark','Vai trò'], 'Nếu ngân sách thấp hơn 15% thì anh/chị cân nhắc gì?'],
      ['Chúng tôi có ngân sách thấp hơn kỳ vọng; anh/chị phản hồi thế nào?', 'Đánh giá kỹ năng đàm phán.', ['Ghi nhận','Hỏi package','Đề xuất phương án'], 'Điều gì ngoài lương quan trọng đối với anh/chị?'],
      ['Anh/chị cần bao lâu để bàn giao công việc và nhận việc?', 'Đánh giá tính sẵn sàng.', ['Thời gian bàn giao','Cam kết','Mốc cụ thể'], 'Nếu cần sớm hơn kế hoạch?'],
      ['Có điều khoản thử việc hoặc KPI offer nào anh/chị muốn làm rõ?', 'Đánh giá thẩm định offer.', ['Lương thử việc','Bảo hiểm','KPIs','Đánh giá'], 'Điều khoản nào bắt buộc phải rõ trước khi nhận?'],
    ]),
  },
  {
    id: 'frontend-review', icon: '05', label: 'Frontend System Design', group: 'Engineering',
    level: 'Senior', time: '15–20 phút', stageId: 'technical', interviewerMode: 'craft', pressureLevel: 'pressure',
    context: 'Review React/Vue, hiệu năng, accessibility và kiến trúc frontend.',
    skills: ['Architecture','Performance','QA'],
    questions: prompts('frontend-review', 'frontend', [
      ['Anh/chị sẽ tổ chức frontend của một hệ thống doanh nghiệp nhiều phân hệ như thế nào?', 'Đánh giá kiến trúc.', ['Modules','State','Contracts','Test'], 'Khi nào chia micro-frontend?'],
      ['Một trang dashboard tải chậm, anh/chị đo và ưu tiên sửa từ đâu?', 'Đánh giá performance.', ['Metrics','Profiler','Bottlenecks','Regression'], 'Nếu API nhanh nhưng TTI chậm thì sao?'],
      ['Anh/chị kiểm soát quyền truy cập và dữ liệu nhạy cảm trên SPA thế nào?', 'Đánh giá security.', ['Auth boundary','Client limits','Server enforcement'], 'Vì sao ẩn nút không phải phân quyền?'],
      ['Khi design system đổi token hoặc component, anh/chị ngăn regression thế nào?', 'Đánh giá quality pipeline.', ['Visual tests','Contract','Rollback','Monitoring'], 'Nếu snapshot tests nhiều false positive thì xử lý sao?'],
      ['Kể về một quyết định kỹ thuật anh/chị phải thay đổi sau production.', 'Đánh giá learning và ownership.', ['Incident','Root cause','Fix','Prevention'], 'Có số liệu đo trước/sau không?'],
    ]),
  },
  {
    id: 'product-case', icon: '06', label: 'Product Case Study', group: 'Product',
    level: 'Mid / Senior', time: '12–18 phút', stageId: 'hiring-manager', interviewerMode: 'hiring-manager', pressureLevel: 'realistic',
    context: 'Ra quyết định ưu tiên tính năng với nguồn lực hữu hạn.',
    skills: ['Prioritization','Metrics','Trade-offs'],
    questions: prompts('product-case', 'product', [
      ['Một sản phẩm có retention giảm nhưng growth tăng, anh/chị chẩn đoán thế nào?', 'Đánh giá decomposition.', ['Segments','Funnel','Cohort','Hypotheses'], 'Chỉ số guardrail nào cần theo dõi?'],
      ['Team chỉ đủ nguồn lực cho một trong ba tính năng, anh/chị ưu tiên ra sao?', 'Đánh giá prioritization.', ['Objectives','Effort','Impact','Risk'], 'Nếu Sales bất đồng với Product?'],
      ['Anh/chị sẽ viết problem statement và đo thành công cho tính năng mới thế nào?', 'Đánh giá clarity.', ['Users','Problem','North-star','Guardrails'], 'Nếu không có dữ liệu baseline?'],
      ['Một thử nghiệm A/B không có ý nghĩa thống kê, anh/chị sẽ làm gì?', 'Đánh giá phương pháp.', ['Sample','Power','Bias','Learning'], 'Khi nào nên dừng thử nghiệm?'],
      ['Làm sao anh/chị truyền đạt quyết định hủy tính năng cho stakeholder?', 'Đánh giá negotiation.', ['Evidence','Trade-off','Alternative','Next step'], 'Nếu lãnh đạo vẫn yêu cầu làm?'],
    ]),
  },
  {
    id: 'data-reliability', icon: '07', label: 'Data & BI Investigation', group: 'Data',
    level: 'Senior', time: '12–18 phút', stageId: 'technical', interviewerMode: 'craft', pressureLevel: 'realistic',
    context: 'Hai dashboard cho kết quả KPI khác nhau, cần truy nguyên chất lượng dữ liệu.',
    skills: ['SQL','Metric logic','Quality'],
    questions: prompts('data-reliability', 'data', [
      ['Hai hệ thống báo cáo doanh thu khác nhau 12%, anh/chị bắt đầu từ đâu?', 'Đánh giá reconciliation.', ['Definitions','Time window','Lineage','Joins'], 'Nếu mỗi nhóm dùng một định nghĩa KPI?'],
      ['Anh/chị thiết kế kiểm tra data quality tự động như thế nào?', 'Đánh giá reliability.', ['Completeness','Freshness','Uniqueness','Alert'], 'Chọn ngưỡng cảnh báo dựa trên gì?'],
      ['Làm sao tránh leak dữ liệu cá nhân vào dashboard?', 'Đánh giá privacy.', ['Access','Masking','Retention','Audit'], 'Nếu dữ liệu đã bị export ra ngoài?'],
      ['Stakeholder muốn insight ngay nhưng dữ liệu chưa đủ tin cậy, anh/chị báo cáo sao?', 'Đánh giá uncertainty.', ['Known/unknown','Confidence','Safe action','Next validation'], 'Rủi ro của quyết định sai là gì?'],
      ['Anh/chị chứng minh dashboard có tác động đến quyết định kinh doanh thế nào?', 'Đánh giá business impact.', ['Adoption','Action','Outcome','Causality'], 'Nếu dashboard nhiều view nhưng ít hành động?'],
    ]),
  },
  {
    id: 'leadership-conflict', icon: '08', label: 'Xung đột & lãnh đạo', group: 'Leadership',
    level: 'Lead', time: '12–18 phút', stageId: 'final', interviewerMode: 'executive', pressureLevel: 'pressure',
    context: 'Giải quyết mâu thuẫn, ngân sách hạn chế và trách nhiệm cuối cùng.',
    skills: ['Conflict','Coaching','Judgment'],
    questions: prompts('leadership-conflict', 'general', [
      ['Kể về lần anh/chị bất đồng mạnh với lãnh đạo hoặc khách hàng nội bộ.', 'Đánh giá maturity.', ['Bối cảnh','Góc nhìn khác nhau','Giải pháp','Kết quả'], 'Điều gì sẽ khiến anh/chị thay đổi quyết định?'],
      ['Một thành viên trong nhóm liên tục không đạt chất lượng, anh/chị làm thế nào?', 'Đánh giá coaching.', ['Evidence','Feedback','Support','Expectation'], 'Khi nào cần thay đổi phân công?'],
      ['Nếu dự án có nguy cơ trễ hạn nhưng lãnh đạo chưa nhận ra, anh/chị xử lý sao?', 'Đánh giá ownership.', ['Risk','Impact','Options','Communication'], 'Nếu báo cáo rủi ro ảnh hưởng đánh giá của team?'],
      ['Khi phải cắt 30% nguồn lực, anh/chị bảo vệ kết quả cốt lõi bằng cách nào?', 'Đánh giá strategy.', ['Must-haves','Trade-offs','Governance','Metrics'], 'Điều gì anh/chị sẽ dừng ngay?'],
      ['Kể về quyết định sai của chính anh/chị và cách sửa chữa.', 'Đánh giá accountability.', ['Decision','Miss','Recovery','Prevention'], 'Đâu là tín hiệu đã bị bỏ qua?'],
    ]),
  },
  {
    id: 'career-transition', icon: '09', label: 'Chuyển việc Senior', group: 'Tuyển dụng',
    level: 'Senior', time: '10–15 phút', stageId: 'hiring-manager', interviewerMode: 'hiring-manager', pressureLevel: 'realistic',
    context: 'Giải thích hành trình nghề nghiệp, kỳ vọng mới và kinh nghiệm lớn.',
    skills: ['Narrative','Impact','90-day plan'],
    questions: prompts('career-transition', 'general', [
      ['Vì sao sau thời gian gắn bó dài anh/chị muốn chuyển sang môi trường mới?', 'Đánh giá sự chủ động.', ['Thành tựu','Giới hạn','Mục tiêu'], 'Vì sao bây giờ mới là thời điểm phù hợp?'],
      ['Năng lực Senior khác Mid rõ nhất ở dự án nào của anh/chị?', 'Đánh giá seniority thực tế.', ['Scope','Judgment','Mentorship','Impact'], 'Nếu không có chức danh Senior chính thức?'],
      ['Anh/chị kỳ vọng làm được gì trong 90 ngày đầu?', 'Đánh giá khả năng onboarding.', ['Discover','Align','Deliver','Measure'], 'Nếu tuần đầu stakeholder không hợp tác?'],
      ['Nhà tuyển dụng lo anh/chị quen quy trình cũ, ít linh hoạt; anh/chị giải thích thế nào?', 'Đánh giá adaptability.', ['Ví dụ thay đổi','Learning','Evidence'], 'Công nghệ nào anh/chị đã tự học gần đây?'],
      ['Điểm nào của trải nghiệm cũ có thể không phù hợp với công ty này?', 'Đánh giá self-awareness.', ['Differences','Risk','Adaptation','Feedback'], 'Anh/chị đã chủ động chuẩn bị ra sao?'],
    ]),
  },
  {
    id: 'ai-project-defense', icon: '10', label: 'AI Project Defense', group: 'AI',
    level: 'Senior / Lead', time: '12–18 phút', stageId: 'technical', interviewerMode: 'skeptical', pressureLevel: 'pressure',
    context: 'Bảo vệ dự án AI/agent trước câu hỏi về chất lượng, bảo mật và chi phí.',
    skills: ['Eval','Latency','Security'],
    questions: prompts('ai-project-defense', 'technical', [
      ['Dự án AI của anh/chị giải quyết bài toán gì mà rule-based không đủ?', 'Đánh giá problem-solution fit.', ['Task','Baseline','AI advantage','Constraints'], 'Nếu baseline rules hoạt động tốt thì vì sao vẫn cần model?'],
      ['Anh/chị xây bộ test và thước đo chất lượng AI như thế nào?', 'Đánh giá evaluation.', ['Golden cases','Precision/Recall','Failure taxonomy','Monitoring'], 'Làm sao tránh leakage giữa test và training data?'],
      ['Làm sao kiểm soát prompt injection và dữ liệu bí mật trong agent?', 'Đánh giá security.', ['Trust boundaries','Least privilege','Validation','Audit'], 'Nếu tool response chứa instruction độc hại?'],
      ['Nếu model chậm và chi phí token tăng gấp đôi, anh/chị tối ưu ra sao?', 'Đánh giá trade-off.', ['Cache','Routing','Batching','Budget'], 'Cắt chi phí có làm giảm chất lượng?'],
      ['Điểm yếu nghiêm trọng nhất của hệ thống AI hiện tại là gì?', 'Đánh giá trung thực kỹ thuật.', ['Known limits','Evidence','Mitigation','Next milestone'], 'Nếu không được nâng cấp, mức rủi ro triển khai là gì?'],
    ]),
  },
]

export const getInterviewScenario = (id) => interviewScenarios.find(item => item.id === id) || null

export const scenarioPracticeQuestions = (scenarioId, size = 5, fallback = []) => {
  const scenario = getInterviewScenario(scenarioId)
  if (!scenario) return fallback.slice(0, size)
  const selected = scenario.questions.slice(0, size)
  const extras = fallback.filter(q => !selected.some(item => item.id === q.id))
  return [...selected, ...extras].slice(0, size)
}
