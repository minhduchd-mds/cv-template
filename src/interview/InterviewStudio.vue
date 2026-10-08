<template>
  <main class="is-shell">
    <aside class="is-sidebar">
      <a class="is-brand" href="#interview-studio" aria-label="Interview Studio">
        <span class="is-brand__mark">IS</span>
        <span>
          <strong>Interview Studio</strong>
          <small>Practice & Evidence Lab</small>
        </span>
      </a>

      <nav class="is-nav" aria-label="Interview Studio modules">
        <button
          v-for="item in modules"
          :key="item.id"
          type="button"
          :class="{ active: activeModule === item.id }"
          :aria-label="item.label"
          :aria-pressed="activeModule === item.id"
          @click="activeModule = item.id"
        >
          <span class="is-nav__icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <b v-if="item.badge">{{ item.badge }}</b>
        </button>
      </nav>

      <section class="is-sidebar__context">
        <span class="is-eyebrow">ACTIVE PROFILE</span>
        <strong>{{ selectedTemplate?.name || 'CV' }}</strong>
        <p>{{ activePack.label }}</p>
        <div>
          <span>{{ seniority }}</span>
          <span>{{ marketLabel }}</span>
        </div>
      </section>

      <div class="is-sidebar__footer">
        <a href="#studio">← CV Studio</a>
        <button type="button" @click="goHome">Trang chủ</button>
      </div>
    </aside>

    <section class="is-stage">
      <header class="is-topbar">
        <div>
          <span class="is-topbar__dot"></span>
          <span>{{ activeModuleLabel }}</span>
          <small>{{ activeApplication ? activeApplication.company + ' · ' + activeApplication.role : 'CV hiện tại · chưa gắn job' }}</small>
        </div>
        <div class="is-topbar__actions">
          <label>
            <span class="sr-only">Current job context</span>
            <select v-model="applicationId">
              <option value="">CV hiện tại · không gắn job</option>
              <option v-for="application in applications" :key="application.id" :value="application.id">
                {{ application.company }} · {{ application.role }}
              </option>
            </select>
          </label>
          <button type="button" class="is-command" @click="startMicroPractice">▶ Luyện ngay</button>
        </div>
      </header>

      <div class="is-content">
        <section v-if="activeModule === 'overview'" class="is-view">
          <section class="is-growth" aria-label="Lộ trình luyện phỏng vấn cá nhân">
            <div class="is-growth__heading">
              <div>
                <span class="is-eyebrow">MY GROWTH · 5 PHÚT MỖI LƯỢT</span>
                <h2>Luyện đúng điểm cần cải thiện</h2>
                <p>Chọn mục tiêu một lần. Mỗi lượt tập trung một kỹ năng.</p>
              </div>
              <span class="is-growth__baseline">{{ growthPlan.hasBaseline ? practiceSessions.length + ' phiên đã luyện' : 'Chưa có bài đầu tiên' }}</span>
            </div>
            <div class="is-growth__goals" role="group" aria-label="Mục tiêu nghề nghiệp">
              <button v-for="goal in candidateGoals" :key="goal.id" type="button"
                :aria-pressed="growthGoalId === goal.id"
                :class="{ active: growthGoalId === goal.id }"
                @click="setGrowthGoal(goal.id)">{{ goal.label }}</button>
            </div>
            <div class="is-growth__focus">
              <div class="is-growth__primary">
                <span class="is-eyebrow">{{ growthPlan.hasBaseline ? 'KỸ NĂNG CẦN TẬP' : 'BẮT ĐẦU TỪ ĐÂY' }}</span>
                <h3>{{ growthPlan.hasBaseline ? growthPlan.focusLabel : 'Tạo mốc luyện tập đầu tiên' }}</h3>
                <p>{{ growthPlan.message }}</p>
                <button type="button" class="is-button is-button--primary" @click="startMicroPractice">
                  {{ growthPlan.hasBaseline ? 'Luyện lại 3 câu →' : 'Luyện 3 câu đầu tiên →' }}
                </button>
                <small>Khoảng 5 phút · Có hướng dẫn sau khi trả lời</small>
              </div>
              <div class="is-growth__steps">
                <span class="is-eyebrow">3 VIỆC CẦN LÀM</span>
                <ol>
                  <li v-for="(tip, i) in growthPlan.checklist" :key="tip"><b>{{ i + 1 }}</b><span>{{ tip }}</span></li>
                </ol>
                <p v-if="growthPlan.isComparable" class="is-growth__trend">
                  Tín hiệu luyện tập: {{ growthPlan.delta > 0 ? '+' : '' }}{{ growthPlan.delta }} điểm so với phiên cùng kịch bản/job.
                </p>
                <p v-else class="is-growth__hint">Chưa có hai lượt cùng bối cảnh để so sánh tiến bộ.</p>
              </div>
            </div>
            <p class="is-growth__disclaimer">Điểm chỉ là phản hồi luyện tập theo quy tắc, không dự đoán khả năng trúng tuyển.</p>
          </section>
          <div class="is-hero">
            <div>
              <span class="is-eyebrow">INTERVIEW STUDIO · VIETNAM-FIRST</span>
              <h1>Biến CV thành <em>lợi thế trong phòng phỏng vấn.</em></h1>
              <p>Chọn việc phù hợp. Bảo vệ kinh nghiệm. Luyện trước vòng thật.</p>
              <div class="is-hero__actions">
                <button type="button" class="is-button is-button--primary" @click="activeModule = 'mock'">Bắt đầu mock interview</button>
                <button type="button" class="is-button" @click="activeModule = 'claims'">Kiểm tra CV claims</button>
              </div>
            </div>
            <article class="is-readiness">
              <div>
                <span>READINESS SIGNAL</span>
                <b>{{ readinessSignal }}</b>
              </div>
              <strong>{{ readinessLabel }}</strong>
              <p>Tín hiệu luyện tập, không dự đoán tuyển dụng.</p>
              <div class="is-readiness__bar"><span :style="{ width: readinessSignal + '%' }"></span></div>
            </article>
          </div>

          <div class="is-stat-grid">
            <article>
              <span>Question bank</span>
              <b>{{ questionDeck.length }}</b>
              <small>{{ vietnamQuestionCount }} câu từ bank Việt Nam</small>
            </article>
            <article>
              <span>CV claims</span>
              <b>{{ cvClaims.length }}</b>
              <small>{{ highRiskClaims.length }} claim cần chuẩn bị kỹ</small>
            </article>
            <article>
              <span>Practice sessions</span>
              <b>{{ practiceSessions.length }}</b>
              <small>{{ totalPracticedAnswers }} câu đã luyện</small>
            </article>
            <article>
              <span>Story bank</span>
              <b>{{ storyBank.length }}</b>
              <small>{{ storyEvidenceReadyCount }} story đã có evidence</small>
            </article>
          </div>

          <div class="is-overview-grid">
            <section class="is-panel">
              <div class="is-panel__heading">
                <div>
                  <span class="is-eyebrow">INTERVIEW CONTEXT</span>
                  <h2>Chuẩn bị theo cơ hội đang ứng tuyển</h2>
                </div>
              </div>
              <div class="is-context-grid">
                <label>
                  <span>Mẫu CV</span>
                  <select v-model="selectedTemplateId">
                    <option v-for="template in templates" :key="template.id" :value="template.id">{{ template.name }}</option>
                  </select>
                </label>
                <label>
                  <span>Role pack</span>
                  <select v-model="rolePackId">
                    <option v-for="pack in interviewPacks" :key="pack.id" :value="pack.id">{{ pack.label }}</option>
                  </select>
                </label>
                <label>
                  <span>Ngành nghề</span>
                  <select v-model="industryId" aria-label="Ngành nghề">
                    <option v-for="industry in industryOptions" :key="industry.id" :value="industry.id">{{ industry.label }}</option>
                  </select>
                </label>
                <label>
                  <span>Seniority</span>
                  <select v-model="seniority">
                    <option v-for="level in seniorityLevels" :key="level" :value="level">{{ level }}</option>
                  </select>
                </label>
                <label>
                  <span>Vòng phỏng vấn</span>
                  <select v-model="stageId">
                    <option v-for="stage in interviewStages" :key="stage.id" :value="stage.id">{{ stage.label }}</option>
                  </select>
                </label>
                <label>
                  <span>Nguồn dữ liệu</span>
                  <select v-model="market">
                    <option value="vietnam">Việt Nam · ưu tiên</option>
                    <option value="all">Việt Nam + Quốc tế</option>
                    <option value="global">Quốc tế</option>
                  </select>
                </label>
              </div>
              <div class="is-signal">
                <span>CV SIGNAL</span>
                <strong>{{ activePack.signal }}</strong>
                <p>Khả năng bị đào sâu: {{ activePack.probe }}</p>
              </div>
            </section>

            <section class="is-panel">
              <div class="is-panel__heading">
                <div>
                  <span class="is-eyebrow">NEXT ACTION</span>
                  <h2>3 việc nên làm trước vòng phỏng vấn</h2>
                </div>
              </div>
              <ol class="is-action-list">
                <li>
                  <b>01</b>
                  <div><strong>Bảo vệ claim mạnh nhất</strong><p>Kiểm chứng số liệu & phần trực tiếp làm.</p></div>
                  <button type="button" @click="openFirstRiskClaim">Mở →</button>
                </li>
                <li>
                  <b>02</b>
                  <div><strong>Luyện 5 câu theo JD</strong><p>5 câu theo CV và job.</p></div>
                  <button type="button" @click="activeModule = 'mock'">Luyện →</button>
                </li>
                <li>
                  <b>03</b>
                  <div><strong>Xem evidence gaps</strong><p>Sửa các điểm còn yếu.</p></div>
                  <button type="button" @click="activeModule = 'reports'">Xem →</button>
                </li>
              </ol>
            </section>
          </div>

          <section v-if="latestReport?.report?.adaptiveCount" class="is-panel is-adaptive-report">
            <div class="is-panel__heading">
              <div>
                <span class="is-eyebrow">ADAPTIVE TRACE</span>
                <h2>Vì sao Interviewer đã hỏi sâu</h2>
              </div>
            </div>
            <div class="is-adaptive-report__stats">
              <div><b>{{ latestReport.report.adaptiveCount }}</b><span>follow-up đã chèn</span></div>
              <div><b>{{ latestReport.report.adaptiveDimensions.length }}</b><span>dimension bị đào sâu</span></div>
            </div>
            <ul class="is-warning-list">
              <li v-for="reason in latestReport.report.adaptiveReasons" :key="reason">{{ reason }}</li>
            </ul>
          </section>

          <section class="is-panel">
            <div class="is-panel__heading is-panel__heading--split">
              <div>
                <span class="is-eyebrow">SOURCE LAYER</span>
                <h2>Nguồn dữ liệu tham khảo</h2>
              </div>
              <span class="is-source-status">{{ activeSources.length }} nguồn đang áp dụng</span>
            </div>
            <div class="is-source-grid">
              <a v-for="source in activeSources" :key="source.id" :href="source.url" target="_blank" rel="noreferrer noopener">
                <span>{{ source.region === 'vietnam' ? 'VN' : 'GL' }}</span>
                <strong>{{ source.name }}</strong>
                <small>{{ source.label }}</small>
                <p v-if="source.region === 'vietnam'">{{ source.note }}</p>
              </a>
            </div>
          </section>
        </section>

        <section v-else-if="activeModule === 'applications'" class="is-view">
          <div class="is-page-heading">
            <div>
              <span class="is-eyebrow">APPLICATION LAB</span>
              <h1>Mỗi job là một <em>workspace phỏng vấn riêng.</em></h1>
              <p>Chọn job, lưu JD và luyện phỏng vấn.</p>
            </div>
            <div class="is-heading-number">{{ applications.length }}</div>
          </div>

          <section class="is-market" aria-label="Việc làm và mức lương Việt Nam">
            <div class="is-market__header">
              <div>
                <span class="is-eyebrow">JOB MARKET · VIETNAM</span>
                <h2>Khám phá cơ hội & lương</h2>
                <small>Dữ liệu đối chiếu {{ jobMarketDate }} · Không phải feed tuyển dụng trực tiếp</small>
              </div>
              <button type="button" class="is-market__toggle" :aria-expanded="showMarketExplorer" @click="showMarketExplorer = !showMarketExplorer">{{ showMarketExplorer ? 'Thu gọn' : 'Mở khám phá' }}</button>
            </div>
            <div v-if="showMarketExplorer" class="is-market__body">
              <div class="is-market__tools">
                <div class="is-market__tabs" role="group" aria-label="Loại dữ liệu việc làm">
                  <button type="button" :aria-pressed="jobMarketTab === 'jobs'" :class="{ active: jobMarketTab === 'jobs' }" @click="jobMarketTab = 'jobs'">Vị trí đã đối chiếu</button>
                  <button type="button" :aria-pressed="jobMarketTab === 'salary'" :class="{ active: jobMarketTab === 'salary' }" @click="jobMarketTab = 'salary'">Lương theo role</button>
                  <button type="button" :aria-pressed="jobMarketTab === 'companies'" :class="{ active: jobMarketTab === 'companies' }" @click="jobMarketTab = 'companies'">Công ty</button>
                </div>
                <label v-if="jobMarketTab !== 'companies'" class="is-market__search">
                  <span class="sr-only">Tìm vị trí hoặc công ty</span>
                  <input v-model="jobMarketSearch" type="search" placeholder="Tìm role / công ty..." aria-label="Tìm role hoặc công ty"/>
                </label>
                <select v-if="jobMarketTab === 'jobs'" v-model="jobMarketCompany" aria-label="Lọc công ty">
                  <option value="all">Tất cả công ty</option>
                  <option v-for="employer in verifiedEmployers" :key="employer.id" :value="employer.id">{{ employer.name }}</option>
                </select>
                <select v-if="jobMarketTab === 'jobs'" v-model="jobMarketCity" aria-label="Lọc khu vực">
                  <option value="all">Toàn quốc</option>
                  <option value="hà nội">Hà Nội</option>
                  <option value="tp.hcm">TP.HCM</option>
                </select>
                <select v-if="jobMarketTab === 'salary'" v-model="jobMarketSalaryCity" aria-label="Thành phố tham khảo">
                  <option value="hanoi">Hà Nội</option>
                  <option value="hcm">TP.HCM</option>
                </select>
                <select v-if="jobMarketTab === 'salary'" v-model="jobMarketSalaryYears" aria-label="Kinh nghiệm tham khảo">
                  <option value="1-5">1–5 năm</option>
                  <option value="5+">Trên 5 năm</option>
                </select>
              </div>
              <div v-if="jobMarketTab === 'jobs'" class="is-market__grid">
                <article v-for="job in marketJobs" :key="job.id" class="is-market__card">
                  <div class="is-market__card-top"><strong>{{ marketEmployer(job.employerId)?.name }}</strong><small>{{ job.location }}</small></div>
                  <h3>{{ job.title }}</h3>
                  <small>Đối chiếu {{ job.checkedAt }} · Lương chưa công bố</small>
                  <div class="is-market__links">
                    <a :href="job.sourceUrl" target="_blank" rel="noopener noreferrer">Xem nguồn ↗</a>
                    <button type="button" @click="useMarketJob(job)">Dùng job này →</button>
                  </div>
                </article>
                <p v-if="!marketJobs.length" class="is-market__empty">Chưa có kết quả trong bản dữ liệu đã đối chiếu. Thử công ty hoặc từ khóa khác.</p>
              </div>
              <div v-else-if="jobMarketTab === 'salary'" class="is-market__grid">
                <article v-for="role in marketSalaryRoles" :key="role.id" class="is-market__card">
                  <div class="is-market__card-top"><strong>{{ role.group }}</strong><small>{{ marketSalarySource(role)?.year }}</small></div>
                  <h3>{{ role.role }}</h3>
                  <strong class="is-market__salary">{{ marketSalary(role) }}</strong>
                  <div class="is-market__links"><span>Tham khảo thị trường · không phải offer</span><a :href="marketSalarySource(role)?.url" target="_blank" rel="noopener noreferrer">{{ marketSalarySource(role)?.name }} ↗</a></div>
                </article>
                <p v-if="!marketSalaryRoles.length" class="is-market__empty">Không tìm thấy role phù hợp.</p>
              </div>
              <div v-else class="is-market__grid">
                <article v-for="employer in verifiedEmployers" :key="employer.id" class="is-market__card">
                  <div class="is-market__card-top"><strong>{{ employer.category }}</strong><small>{{ employer.location }}</small></div>
                  <h3>{{ employer.name }}</h3>
                  <div class="is-market__links"><span>{{ employer.source }}</span><a :href="employer.careersUrl" target="_blank" rel="noopener noreferrer">Trang tuyển dụng ↗</a></div>
                </article>
              </div>
              <p class="is-market__disclaimer">Tin đăng có thể thay đổi; xác minh tại website công ty. Báo cáo ITviec là trung vị toàn quốc, Adecco là khoảng gross theo thành phố/kinh nghiệm. Không suy ra lương từng doanh nghiệp.</p>
            </div>
          </section>

          <div class="is-application-layout">
            <aside class="is-application-list">
              <div class="is-application-list__head">
                <span class="is-eyebrow">APPLICATIONS</span>
                <button type="button" @click="newApplication">＋ New</button>
              </div>
              <button
                v-for="application in applications"
                :key="application.id"
                type="button"
                :class="{ active: applicationDraft.id === application.id }"
                @click="applicationId = application.id; editApplication(application)"
              >
                <span>
                  <small>{{ application.status || 'Saved' }}</small>
                  <strong>{{ application.company || 'Chưa có công ty' }}</strong>
                  <p>{{ application.role || 'Chưa có vị trí' }}</p>
                </span>
                <b>→</b>
              </button>
              <div v-if="!applications.length" class="is-application-empty">Chưa có application. Tạo job đầu tiên ở bên phải.</div>
            </aside>

            <section class="is-application-editor">
              <div class="is-application-editor__heading">
                <div>
                  <span class="is-eyebrow">{{ applicationDraft.id ? 'EDIT APPLICATION' : 'NEW APPLICATION' }}</span>
                  <h2>{{ applicationDraft.company || 'Cơ hội tuyển dụng mới' }}</h2>
                </div>
                <div v-if="applicationDraftAnalysis" class="is-coverage-score">
                  <b>{{ applicationDraftAnalysis.coverage }}</b>
                  <span>evidence coverage</span>
                </div>
              </div>

              <div class="is-application-form">
                <label><span>Công ty</span><input v-model="applicationDraft.company" type="text" placeholder="Viettel Digital, FPT, Shopee..." /></label>
                <label><span>Vị trí</span><input v-model="applicationDraft.role" type="text" placeholder="Senior Product Designer" /></label>
                <label><span>Pipeline</span><select v-model="applicationDraft.status"><option v-for="status in applicationStatuses" :key="status" :value="status">{{ status }}</option></select></label>
                <label><span>JD / nguồn</span><input v-model="applicationDraft.sourceUrl" type="url" placeholder="https://..." /></label>
                <label class="wide"><span>Job Description</span><textarea v-model="applicationDraft.jd" rows="10" placeholder="Dán toàn bộ JD hoặc các yêu cầu chính. Interview Studio chỉ dùng local để tạo context luyện tập..."></textarea></label>
                <label class="wide"><span>Ghi chú</span><textarea v-model="applicationDraft.notes" rows="4" placeholder="Hiring manager round, ngôn ngữ phỏng vấn, người giới thiệu, lưu ý về team..."></textarea></label>
              </div>

              <div class="is-application-actions">
                <button v-if="applicationDraft.id" type="button" class="is-text-button danger" @click="deleteApplication(applicationDraft.id)">Xóa application</button>
                <span></span>
                <button type="button" class="is-button" @click="saveApplication">Lưu context</button>
                <button type="button" class="is-button is-button--primary" :disabled="!applicationDraftAnalysis" @click="practiceApplication(applicationDraft)">Luyện job này →</button>
              </div>

              <template v-if="applicationDraftAnalysis">
                <div class="is-coverage-summary">
                  <div class="is-coverage-ring"><b>{{ applicationDraftAnalysis.coverage }}</b><span>/100</span></div>
                  <div>
                    <span class="is-eyebrow">EVIDENCE COVERAGE · KHÔNG PHẢI XÁC SUẤT ĐẬU</span>
                    <h3>{{ applicationDraftAnalysis.summary }}</h3>
                    <p>Stage đề xuất: {{ interviewStages.find((item) => item.id === applicationDraftAnalysis.recommendedStage)?.label || 'Hiring Manager' }}</p>
                  </div>
                </div>

                <div class="is-coverage-grid">
                  <section>
                    <span class="is-eyebrow">MATCHED SIGNALS</span>
                    <div class="is-signal-tags"><span v-for="signal in applicationDraftAnalysis.matchedSignals" :key="signal">{{ signal }}</span><small v-if="!applicationDraftAnalysis.matchedSignals.length">Chưa có signal đủ rõ.</small></div>
                  </section>
                  <section>
                    <span class="is-eyebrow">EVIDENCE GAPS</span>
                    <div class="is-signal-tags gaps"><span v-for="signal in applicationDraftAnalysis.gapSignals" :key="signal">{{ signal }}</span><small v-if="!applicationDraftAnalysis.gapSignals.length">Không phát hiện gap token đáng kể.</small></div>
                  </section>
                </div>

                <details class="is-deep-evidence">
                  <summary>CV & Story evidence chi tiết <span>＋</span></summary>
                <div class="is-coverage-grid">
                  <section>
                    <span class="is-eyebrow">TOP CV EVIDENCE</span>
                    <ol class="is-coverage-list">
                      <li v-for="item in applicationDraftAnalysis.topClaims" :key="item.id"><strong>{{ item.label }}</strong><p>{{ item.text }}</p></li>
                    </ol>
                  </section>
                  <section>
                    <span class="is-eyebrow">TOP STORY EVIDENCE</span>
                    <ol class="is-coverage-list">
                      <li v-for="item in applicationDraftAnalysis.topStories" :key="item.id"><strong>{{ item.label }}</strong><p>{{ item.text }}</p></li>
                      <li v-if="!applicationDraftAnalysis.topStories.length"><p>Chưa có Story Bank phù hợp với JD này.</p></li>
                    </ol>
                  </section>
                </div>

                </details>

                <section class="is-stage-matrix">
                  <div class="is-panel__heading is-panel__heading--split">
                    <div>
                      <span class="is-eyebrow">INTERVIEW STAGE MATRIX</span>
                      <h3>Chọn vòng phỏng vấn</h3>
                    </div>
                    <small>Preparedness = tín hiệu chuẩn bị nội bộ</small>
                  </div>
                  <div class="is-stage-matrix__grid">
                    <article
                      v-for="stage in applicationStageMatrix"
                      :key="stage.id"
                      :class="{ recommended: stage.recommended }"
                    >
                      <div class="is-stage-matrix__top">
                        <div>
                          <span v-if="stage.recommended">RECOMMENDED NEXT</span>
                          <strong>{{ stage.label }}</strong>
                        </div>
                        <b>{{ stage.preparedness }}</b>
                      </div>
                      <p>{{ stage.evidence }}</p>
                      <div class="is-stage-matrix__focus">
                        <span v-for="term in stage.focus" :key="term">{{ term }}</span>
                      </div>
                      <details class="is-stage-questions">
                        <summary>Xem {{ stage.questions.length }} câu hỏi</summary>
                        <ol>
                          <li v-for="question in stage.questions" :key="question.id">{{ question.question }}</li>
                        </ol>
                      </details>
                      <button type="button" @click="stageId = stage.id; practiceApplication(applicationDraft)">
                        Luyện vòng này →
                      </button>
                    </article>
                  </div>
                </section>

                <section class="is-application-questions">
                  <span class="is-eyebrow">RECOMMENDED INTERVIEW QUESTIONS</span>
                  <ol>
                    <li v-for="item in applicationDraftAnalysis.recommendedQuestions.slice(0, 3)" :key="item.id">
                      <span>{{ categoryName(item.category) }}</span>
                      <strong>{{ item.question }}</strong>
                    </li>
                  </ol>
                </section>
              </template>
            </section>
          </div>
        </section>

        <section v-else-if="activeModule === 'questions'" class="is-view">
          <div class="is-page-heading">
            <div>
              <span class="is-eyebrow">QUESTION BANK</span>
              <h1>Câu hỏi theo <em>role, CV, JD và vòng tuyển dụng.</em></h1>
              <p>Mỗi câu đều có recruiter intent, framework, follow-up, red flags và nguồn tham khảo khi có.</p>
            </div>
            <div class="is-heading-number">{{ filteredQuestions.length }}</div>
          </div>

          <section class="is-filterbar">
            <label class="is-search">
              <span>Tìm câu hỏi</span>
              <input v-model.trim="query" type="search" placeholder="stakeholder, design system, failure, metric..." />
            </label>
            <label>
              <span>Nhóm</span>
              <select v-model="categoryId">
                <option v-for="category in questionCategories" :key="category.id" :value="category.id">{{ category.label }}</option>
              </select>
            </label>
            <label>
              <span>Dữ liệu</span>
              <select v-model="market">
                <option value="vietnam">Việt Nam</option>
                <option value="all">VN + Quốc tế</option>
                <option value="global">Quốc tế</option>
              </select>
            </label>
          </section>

          <div class="is-question-grid">
            <details v-for="(item, index) in filteredQuestions" :key="item.id" class="is-question" :open="index === 0">
              <summary>
                <span class="is-question__number">{{ String(index + 1).padStart(2, '0') }}</span>
                <div>
                  <small>{{ categoryName(item.category) }} <b v-if="item.market === 'vietnam'">SOURCE VN</b></small>
                  <strong>{{ item.question }}</strong>
                </div>
                <span class="is-question__plus">+</span>
              </summary>
              <div class="is-question__body">
                <section>
                  <span>Recruiter intent</span>
                  <p>{{ item.why }}</p>
                </section>
                <section>
                  <span>Answer framework</span>
                  <ol><li v-for="step in item.framework" :key="step">{{ step }}</li></ol>
                </section>
                <section class="is-question__example">
                  <span>Ví dụ tham khảo</span>
                  <p>“{{ item.example }}”</p>
                </section>
                <section>
                  <span>Follow-up</span>
                  <ul><li v-for="followUp in item.followUps" :key="followUp">{{ followUp }}</li></ul>
                </section>
                <section class="is-question__avoid">
                  <span>Red flags</span>
                  <ul><li v-for="risk in item.avoid" :key="risk">{{ risk }}</li></ul>
                </section>
                <section v-if="questionSources(item).length" class="is-question__sources">
                  <span>Provenance</span>
                  <div>
                    <a v-for="source in questionSources(item)" :key="source.id" :href="source.url" target="_blank" rel="noreferrer noopener">
                      {{ source.name }} · {{ source.label }} ↗
                    </a>
                  </div>
                </section>
              </div>
            </details>
          </div>
        </section>

        <section v-else-if="activeModule === 'claims'" class="is-view">
          <div class="is-page-heading">
            <div>
              <span class="is-eyebrow">CLAIM DEFENSE</span>
              <h1>Mọi claim trong CV đều phải <em>chịu được câu hỏi đào sâu.</em></h1>
              <p>Interview Studio trích xuất các statement quan trọng, phát hiện claim có số liệu/ownership và tạo recruiter probes để anh chuẩn bị evidence.</p>
            </div>
            <div class="is-heading-number">{{ cvClaims.length }}</div>
          </div>

          <div class="is-claim-layout">
            <aside class="is-claim-list">
              <button
                v-for="item in cvClaims"
                :key="item.id"
                type="button"
                :class="{ active: selectedClaimId === item.id }"
                @click="selectedClaimId = item.id"
              >
                <span>
                  <small>{{ item.source }} · {{ item.label }}</small>
                  <strong>{{ item.text }}</strong>
                </span>
                <b :class="{ high: claimRisk(item) >= 70 }">{{ claimRisk(item) }}</b>
              </button>
            </aside>

            <section v-if="selectedClaim" class="is-claim-detail">
              <div class="is-claim-detail__header">
                <div>
                  <span class="is-eyebrow">CLAIM {{ selectedClaimIndex + 1 }} / {{ cvClaims.length }}</span>
                  <h2>{{ selectedClaim.text }}</h2>
                </div>
                <div class="is-risk-ring">
                  <b>{{ claimRisk(selectedClaim) }}</b>
                  <span>probe risk</span>
                </div>
              </div>

              <div class="is-claim-meta">
                <span v-if="selectedClaim.numbers.length"># Có số liệu: {{ selectedClaim.numbers.join(', ') }}</span>
                <span v-if="selectedClaim.leadershipSignal"># Ownership / leadership</span>
                <span v-if="selectedClaim.outcomeSignal"># Outcome claim</span>
                <span># {{ selectedClaim.source }}</span>
              </div>

              <div class="is-claim-section">
                <span class="is-eyebrow">RECRUITER PROBES</span>
                <ol class="is-probe-list">
                  <li v-for="probe in selectedClaimProbes" :key="probe">{{ probe }}</li>
                </ol>
              </div>

              <div class="is-claim-section">
                <span class="is-eyebrow">MATCHED QUESTIONS</span>
                <div class="is-matched-questions">
                  <button v-for="question in selectedClaimQuestions" :key="question.id" type="button" @click="jumpToQuestion(question)">
                    <span>{{ categoryName(question.category) }}</span>
                    <strong>{{ question.question }}</strong>
                    <b>→</b>
                  </button>
                  <p v-if="!selectedClaimQuestions.length">Chưa có câu hỏi đủ gần; dùng recruiter probes phía trên để luyện trực tiếp.</p>
                </div>
              </div>

              <div v-if="unassignedLegacyNotes.length" class="is-claim-section is-legacy-notes">
                <span class="is-eyebrow">GHI CHÚ CŨ CẦN GÁN LẠI</span>
                <p>Ghi chú từng gắn theo thứ tự CV; hệ thống không tự đoán thuộc claim nào. Chỉ chuyển khi anh xác nhận đúng nội dung.</p>
                <article v-for="item in unassignedLegacyNotes" :key="item.legacyId">
                  <small>{{ item.legacyId }}</small>
                  <p>{{ item.note }}</p>
                  <button type="button" :disabled="Boolean(claimNote.trim())" @click="assignLegacyNote(item)">Gán vào claim đang chọn</button>
                </article>
              </div>

              <div class="is-claim-section">
                <span class="is-eyebrow">EVIDENCE NOTE</span>
                <p v-if="claimEvidence[selectedClaim.id]?.needsReview" role="status">
                  Ghi chú từ CV phiên bản cũ: cần xác minh lại nội dung vì thứ tự claim đã thay đổi. Trạng thái ready không được tự động chuyển sang claim mới.
                </p>
                <textarea
                  v-model="claimNote"
                  rows="6"
                  placeholder="Baseline, phạm vi mình sở hữu, cách đo, ai tham gia, trade-off, result, tài liệu có thể kiểm chứng..."
                  @change="saveClaimNote"
                ></textarea>
                <div class="is-claim-note-footer">
                  <span>{{ claimNote.length }} ký tự</span>
                  <button type="button" :class="{ ready: selectedClaimReady }" @click="toggleClaimReady">
                    {{ selectedClaimReady ? '✓ Evidence ready' : 'Đánh dấu evidence ready' }}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="activeModule === 'stories'" class="is-view">
          <div class="is-page-heading">
            <div>
              <span class="is-eyebrow">STORY BANK</span>
              <h1>Lưu những câu chuyện nghề nghiệp <em>đủ mạnh để dùng lại.</em></h1>
              <p>Story Bank giữ câu trả lời tốt, evidence, claim liên quan và practice signal. Mỗi story có thể luyện lại riêng với adaptive follow-up.</p>
            </div>
            <div class="is-heading-number">{{ storyBank.length }}</div>
          </div>

          <div class="is-story-stats">
            <article><span>Stories</span><b>{{ storyBank.length }}</b><small>câu chuyện đã lưu</small></article>
            <article><span>Evidence ready</span><b>{{ storyEvidenceReadyCount }}</b><small>có STAR/evidence anchor</small></article>
            <article><span>Average signal</span><b>{{ storyAverageScore || '—' }}</b><small>practice signal trung bình</small></article>
          </div>

          <div v-if="storyBank.length" class="is-story-grid">
            <article v-for="story in storyBank" :key="story.id" class="is-story-card">
              <div class="is-story-card__top">
                <div>
                  <span>{{ story.categoryLabel }} · {{ story.contextLabel }}</span>
                  <h2>{{ story.title }}</h2>
                </div>
                <b>{{ story.score || '—' }}</b>
              </div>
              <p class="is-story-card__question">{{ story.question }}</p>
              <blockquote>{{ story.answer }}</blockquote>
              <div v-if="story.evidence" class="is-story-evidence">
                <span>EVIDENCE</span>
                <p>{{ story.evidence }}</p>
              </div>
              <div v-if="story.claims?.length" class="is-story-claims">
                <span v-for="claim in story.claims" :key="claim.id">{{ claim.label }}</span>
              </div>
              <div class="is-story-card__footer">
                <small>Cập nhật {{ formatSessionDate(story.updatedAt || story.createdAt) }}</small>
                <div>
                  <button type="button" @click="startStoryPractice(story)">Luyện lại →</button>
                  <button type="button" class="danger" @click="deleteStory(story.id)">Xóa</button>
                </div>
              </div>
            </article>
          </div>
          <div v-else class="is-empty is-story-empty">
            Chưa có story. Trong Mock Interview, đánh giá một câu trả lời rồi chọn “Lưu vào Story Bank”.
            <button type="button" @click="activeModule = 'mock'">Bắt đầu luyện →</button>
          </div>
        </section>

        <section v-else-if="activeModule === 'mock'" class="is-view">
          <div class="is-page-heading">
            <div>
              <span class="is-eyebrow">MOCK INTERVIEW</span>
              <h1>Luyện phỏng vấn <em>theo tình huống.</em></h1>
              <p>Chọn kịch bản, trả lời, nhận phản hồi và luyện lại.</p>
            </div>
            <div class="is-heading-number">{{ practiceActive ? practiceIndex + 1 + '/' + practiceQuestions.length : '5Q' }}</div>
          </div>

          <section v-if="!practiceActive" class="is-scenario-picker" aria-label="Kịch bản phỏng vấn">
            <div class="is-scenario-picker__heading">
              <div>
                <span class="is-eyebrow">PRACTICE SCENARIOS</span>
                <h2>Chọn kịch bản phỏng vấn</h2>
                <p>10 tình huống · Từ HR đến vòng chuyên môn và đàm phán offer</p>
              </div>
              <div class="is-scenario-picker__actions">
                <button type="button" class="is-text-button" @click="showAllScenarios = !showAllScenarios">{{ showAllScenarios ? 'Thu gọn' : 'Xem đủ 10 kịch bản' }}</button>
                <button v-if="selectedScenarioId" type="button" class="is-text-button" @click="selectScenario('')">Bỏ chọn</button>
              </div>
            </div>
            <div class="is-scenario-grid">
              <button
                v-for="scenario in visibleScenarios"
                :key="scenario.id"
                type="button"
                class="is-scenario-card"
                :class="{ 'is-scenario-card--active': selectedScenarioId === scenario.id }"
                :aria-pressed="selectedScenarioId === scenario.id"
                @click="selectScenario(scenario.id)"
              >
                <span class="is-scenario-card__number">{{ scenario.icon }}</span>
                <span class="is-scenario-card__body">
                  <strong>{{ scenario.label }}</strong>
                  <small>{{ scenario.group }} · {{ scenario.time }}</small>
                </span>
                <span class="is-scenario-card__check">{{ selectedScenarioId === scenario.id ? '✓' : '↗' }}</span>
              </button>
            </div>
            <div v-if="selectedScenario" class="is-scenario-preview">
              <span>{{ selectedScenario.level }} · {{ selectedScenario.questions.length }} câu gốc</span>
              <p>{{ selectedScenario.context }}</p>
              <button type="button" class="is-button is-button--primary" @click="startPractice">Luyện kịch bản này →</button>
            </div>
          </section>

          <section v-if="!practiceActive" class="is-mock-start">
            <div class="is-mock-config">
              <div>
                <span class="is-eyebrow">SESSION CONFIG</span>
                <h2>Tạo một vòng luyện có context</h2>
              </div>
              <label>
                <span>Application</span>
                <select v-model="applicationId">
                  <option value="">CV hiện tại · không gắn job</option>
                  <option v-for="application in applications" :key="application.id" :value="application.id">
                    {{ application.company }} · {{ application.role }}
                  </option>
                </select>
              </label>
              <label>
                <span>Vòng phỏng vấn</span>
                <select v-model="stageId">
                  <option v-for="stage in interviewStages" :key="stage.id" :value="stage.id">{{ stage.label }}</option>
                </select>
              </label>
              <label>
                <span>Interviewer mode</span>
                <select v-model="interviewerMode">
                  <option v-for="mode in interviewerModes" :key="mode.id" :value="mode.id">{{ mode.label }}</option>
                </select>
              </label>
              <label>
                <span>Pressure</span>
                <select v-model="pressureLevel">
                  <option v-for="level in pressureLevels" :key="level.id" :value="level.id">{{ level.label }}</option>
                </select>
              </label>
              <label>
                <span>Timer / câu</span>
                <select v-model.number="timerChoice">
                  <option :value="60">60 giây</option>
                  <option :value="90">90 giây</option>
                  <option :value="120">120 giây</option>
                </select>
              </label>
              <label>
                <span>Số câu</span>
                <select v-model.number="practiceSize">
                  <option :value="5">5 câu · Quick round</option>
                  <option :value="8">8 câu · Full round</option>
                </select>
              </label>
            </div>

            <div class="is-mock-preview">
              <span class="is-eyebrow">WHAT THE ENGINE USES</span>
              <div><b>{{ cvClaims.length }}</b><span>CV claims</span></div>
              <div><b>{{ activeApplication ? 'JD' : 'CV' }}</b><span>application context</span></div>
              <div><b>{{ activeStageLabel }}</b><span>interview stage</span></div>
              <div><b>{{ activeInterviewer.shortLabel }}</b><span>{{ activeInterviewer.label }}</span></div>
              <div><b>{{ activePressure.label }}</b><span>adaptive pressure</span></div>
              <div><b>{{ industryPracticeProfiles[resolvedIndustryId]?.label || 'Industry' }}</b><span>industry context</span></div>
              <div><b>{{ marketLabel }}</b><span>question sources</span></div>
              <button type="button" class="is-button is-button--primary" @click="startPractice">Bắt đầu session →</button>
            </div>
          </section>

          <section v-else-if="practiceCurrent" class="is-live-session">
            <div class="is-live-session__meta">
              <div>
                <span>
                  QUESTION {{ practiceIndex + 1 }} / {{ practiceQuestions.length }}
                  <b v-if="practiceCurrent.adaptive?.isFollowUp" class="is-adaptive-badge">ADAPTIVE FOLLOW-UP</b>
                </span>
                <small>{{ selectedScenario?.label || categoryName(practiceCurrent.category) }} · {{ activeStageLabel }} · {{ activeInterviewer.label }} · {{ activePressure.label }}</small>
              </div>
              <div class="is-timer" :class="{ warning: timerRemaining <= 20 }">
                <b>{{ formattedTimer }}</b>
                <span>{{ timerRunning ? 'đang chạy' : 'tạm dừng' }}</span>
              </div>
            </div>

            <div v-if="practiceCurrent.adaptive?.isFollowUp" class="is-adaptive-reason">
              <span>WHY THIS FOLLOW-UP</span>
              <p>{{ practiceCurrent.adaptive.reason }}</p>
              <small>
                Trigger: {{ dimensionLabel(practiceCurrent.adaptive.triggerDimension) }} · {{ practiceCurrent.adaptive.triggerScore }}/100
                · {{ practiceCurrent.adaptive.interviewerLabel || activeInterviewer.label }}
                · {{ practiceCurrent.adaptive.pressureLabel || activePressure.label }}
              </small>
            </div>

            <h2>{{ practiceCurrent.question }}</h2>

            <div class="is-live-session__tools">
              <button type="button" @click="speakQuestion">🔊 Đọc câu hỏi</button>
              <button type="button" :disabled="!speechSupported" :class="{ recording: speechRecording }" @click="toggleDictation">
                {{ speechRecording ? '■ Dừng ghi âm' : '🎙 Trả lời bằng giọng nói' }}
              </button>
              <button type="button" @click="toggleTimer">{{ timerRunning ? 'Ⅱ Tạm dừng timer' : '▶ Tiếp tục timer' }}</button>
            </div>

            <div class="is-answer-grid">
              <label>
                <span>Câu trả lời của anh</span>
                <textarea
                  ref="practiceAnswer"
                  v-model="currentDraft.answer"
                  @input="invalidateCurrentEvaluation"
                  rows="9"
                  placeholder="Nói hoặc nhập đúng cách anh sẽ trả lời trong buổi phỏng vấn thật..."
                ></textarea>
                <small>{{ currentAnswerWords }} từ · {{ speechSupported ? 'Speech input khả dụng' : 'Trình duyệt chưa hỗ trợ speech input' }}</small>
              </label>
              <label>
                <span>Evidence / STAR anchors</span>
                <textarea
                  v-model="currentDraft.evidence"
                  @input="invalidateCurrentEvaluation"
                  rows="6"
                  placeholder="Project · ownership · baseline · decision · trade-off · result · learning"
                ></textarea>
                <small>Evidence riêng giúp engine không nhầm câu trả lời dài với câu trả lời có bằng chứng.</small>
              </label>
            </div>

            <label class="is-confidence">
              <span>Mức tự tin</span>
              <input v-model.number="currentDraft.confidence" @input="invalidateCurrentEvaluation" type="range" min="1" max="5" step="1" />
              <b>{{ currentDraft.confidence }}/5</b>
            </label>

            <div v-if="currentDraft.evaluation" class="is-evaluation">
              <div class="is-evaluation__score">
                <b>{{ currentDraft.evaluation.overall }}</b>
                <span>practice signal</span>
              </div>
              <div class="is-evaluation__bars">
                <div v-for="(score, key) in currentDraft.evaluation.dimensions" :key="key">
                  <span>{{ dimensionLabel(key) }}</span>
                  <i><b :style="{ width: score + '%' }"></b></i>
                  <strong>{{ score }}</strong>
                </div>
              </div>
              <ul v-if="currentDraft.evaluation.warnings.length">
                <li v-for="warning in currentDraft.evaluation.warnings" :key="warning">{{ warning }}</li>
              </ul>
            </div>

            <section v-if="currentImprovement" class="is-retry-coach" aria-label="Một điều cần cải thiện">
              <div class="is-retry-coach__title">
                <span class="is-eyebrow">ĐIỂM CẦN SỬA</span>
                <strong>{{ currentImprovement.title }}</strong>
              </div>
              <p>{{ currentImprovement.action }}</p>
              <small>{{ currentImprovement.check }}</small>
              <div v-if="currentRetryComparison" class="is-retry-coach__comparison" role="status">
                <strong>{{ currentRetryComparison.difference > 0 ? '+' : '' }}{{ currentRetryComparison.difference }} điểm</strong>
                <span>Trước {{ currentRetryComparison.previous }} → sau {{ currentRetryComparison.current }} · {{ currentRetryComparison.note }}</span>
              </div>
              <button type="button" class="is-button" @click="retryCurrentAnswer">Sửa và đánh giá lại ↻</button>
            </section>
            <p v-if="currentDraft.retryBaseline && !currentDraft.evaluation" class="is-revision-prompt" role="status">Câu trả lời đã được sửa. Bấm “Đánh giá câu này” để cập nhật phản hồi.</p>
            <button type="button" class="is-coach-toggle" @click="practiceShowGuide = !practiceShowGuide">
              {{ practiceShowGuide ? 'Ẩn Answer Coach' : 'Mở Answer Coach sau khi đã trả lời' }}
            </button>

            <div v-if="practiceShowGuide" class="is-coach-grid">
              <section><span>Recruiter intent</span><p>{{ practiceCurrent.why }}</p></section>
              <section><span>Framework</span><ol><li v-for="step in practiceCurrent.framework" :key="step">{{ step }}</li></ol></section>
              <section><span>Reference answer</span><p>“{{ practiceCurrent.example }}”</p></section>
              <section><span>Adaptive follow-up</span><ul><li v-for="followUp in adaptiveFollowUps" :key="followUp">{{ followUp }}</li></ul></section>
            </div>

            <div class="is-session-actions">
              <button
                v-if="currentDraft.evaluation && currentDraft.answer"
                type="button"
                class="is-button is-button--story"
                :class="{ saved: currentStorySaved }"
                @click="saveCurrentStory"
              >
                {{ currentStorySaved ? '✓ Đã lưu Story Bank' : '✦ Lưu vào Story Bank' }}
              </button>
              <button type="button" class="is-button" @click="evaluateCurrent">Đánh giá câu này</button>
              <button type="button" class="is-button is-button--primary" @click="nextPractice">
                {{ nextPracticeLabel }}
              </button>
            </div>
          </section>
        </section>

        <section v-else-if="activeModule === 'reports'" class="is-view">
          <div class="is-growth-next" role="region" aria-label="Luyện lượt tiếp theo">
            <div><span class="is-eyebrow">NEXT BEST ACTION</span><strong>{{ growthPlan.focusLabel }}</strong><small>{{ growthPlan.selfCheck }}</small></div>
            <button type="button" class="is-button is-button--primary" @click="startMicroPractice">Luyện lại 3 câu →</button>
          </div>
          <div class="is-page-heading">
            <div>
              <span class="is-eyebrow">INTERVIEW REPORTS</span>
              <h1>Đo tiến bộ bằng <em>evidence và hành vi quan sát được.</em></h1>
              <p>Không chấm “cảm xúc” hay dự đoán tuyển dụng. Report tập trung relevance, structure, evidence, ownership, depth, credibility và delivery.</p>
            </div>
            <div class="is-heading-number">{{ practiceSessions.length }}</div>
          </div>

          <section v-if="latestReport" class="is-report-hero">
            <div class="is-report-score">
              <span>LATEST PRACTICE SIGNAL</span>
              <b>{{ latestReport.report.overall }}</b>
              <small>/100</small>
            </div>
            <div>
              <strong>{{ latestReport.contextLabel }}</strong>
              <p>
                {{ formatSessionDate(latestReport.createdAt) }} · {{ latestReport.stageLabel }}
                · {{ latestReport.interviewerLabel || 'Interviewer' }} · {{ latestReport.pressureLabel || 'Realistic' }}
                · {{ latestReport.answered }}/{{ latestReport.total }} câu
              </p>
              <span>{{ latestReport.report.evidenceReady }}/{{ latestReport.total }} câu có evidence note · {{ latestReport.report.skipped || 0 }} câu bỏ qua · {{ latestReport.report.adaptiveCount || 0 }} follow-up</span>
              <small v-if="latestReport.report.revisions?.revised">
                {{ latestReport.report.revisions.revised }} câu đã sửa · {{ latestReport.report.revisions.improved }} câu có tín hiệu cải thiện sau sửa
              </small>
            </div>
          </section>

          <div v-if="latestReport" class="is-report-grid">
            <section class="is-panel">
              <div class="is-panel__heading"><div><span class="is-eyebrow">DIMENSIONS</span><h2>Điểm cần cải thiện</h2></div></div>
              <div class="is-report-bars">
                <div v-for="(score, key) in latestReport.report.dimensions" :key="key">
                  <span>{{ dimensionLabel(key) }}</span>
                  <i><b :style="{ width: score + '%' }"></b></i>
                  <strong>{{ score }}</strong>
                </div>
              </div>
            </section>
            <section class="is-panel">
              <div class="is-panel__heading"><div><span class="is-eyebrow">EVIDENCE GAPS</span><h2>Việc cần sửa trước lần luyện sau</h2></div></div>
              <ul class="is-warning-list">
                <li v-for="warning in latestReport.report.warnings" :key="warning">{{ warning }}</li>
                <li v-if="!latestReport.report.warnings.length">Chưa phát hiện cảnh báo lớn trong session gần nhất.</li>
              </ul>
            </section>
          </div>

          <section v-if="latestReport?.report?.adaptiveTrace?.length" class="is-panel is-branch-trace">
            <div class="is-panel__heading is-panel__heading--split">
              <div>
                <span class="is-eyebrow">BRANCH MEMORY</span>
                <h2>Interviewer đã rẽ nhánh ở đâu và vì sao</h2>
              </div>
              <small>{{ latestReport.report.adaptiveTrace.length }} branch</small>
            </div>
            <div class="is-branch-trace__list">
              <article v-for="item in latestReport.report.adaptiveTrace" :key="item.questionId">
                <div class="is-branch-trace__index">{{ String(item.index).padStart(2, '0') }}</div>
                <div>
                  <span>{{ item.interviewerLabel || latestReport.interviewerLabel }} · {{ item.pressureLabel || latestReport.pressureLabel }}</span>
                  <strong>{{ item.question }}</strong>
                  <p>{{ item.reason }}</p>
                </div>
                <div class="is-branch-trace__trigger">
                  <span>{{ dimensionLabel(item.triggerDimension) }}</span>
                  <b>{{ item.triggerScore }}</b>
                </div>
              </article>
            </div>
          </section>

          <section v-if="latestPracticePlan" class="is-panel is-practice-plan">
            <div class="is-panel__heading is-panel__heading--split">
              <div>
                <span class="is-eyebrow">NEXT PRACTICE PLAN</span>
                <h2>{{ latestPracticePlan.summary }}</h2>
              </div>
              <button type="button" class="is-button is-button--primary" @click="startPracticePlan(latestPracticePlan)">Luyện plan này →</button>
            </div>
            <div class="is-practice-plan__focus">
              <article v-for="area in latestPracticePlan.focusAreas" :key="area.key">
                <div><strong>{{ area.label }}</strong><b>{{ area.score }}</b></div>
                <p>{{ area.objective }}</p>
              </article>
            </div>
            <div class="is-practice-plan__questions">
              <span class="is-eyebrow">RECOMMENDED QUESTIONS</span>
              <ol>
                <li v-for="item in latestPracticePlan.recommendedQuestions" :key="item.id">{{ item.question }}</li>
              </ol>
            </div>
            <div v-if="latestPracticePlan.claims?.length" class="is-practice-plan__claims">
              <span class="is-eyebrow">CLAIMS TO DEFEND</span>
              <div><span v-for="claim in latestPracticePlan.claims" :key="claim.id">{{ claim.label }} · {{ claim.text }}</span></div>
            </div>
          </section>

          <section class="is-panel">
            <div class="is-panel__heading is-panel__heading--split">
              <div><span class="is-eyebrow">HISTORY</span><h2>Lịch sử luyện tập</h2></div>
              <button v-if="practiceSessions.length" type="button" class="is-text-button" @click="clearPracticeHistory">Xóa lịch sử local</button>
            </div>
            <div v-if="practiceSessions.length" class="is-history-table">
              <article v-for="session in practiceSessions" :key="session.id">
                <div><strong>{{ session.contextLabel }}</strong><small>{{ formatSessionDate(session.createdAt) }}</small></div>
                <span>{{ session.stageLabel }}</span>
                <span>{{ session.answered }}/{{ session.total }} answered</span>
                <span>{{ session.report?.evidenceReady || session.evidenceReady || 0 }} evidence</span>
                <b>{{ session.report?.overall || session.averageConfidence * 20 || '—' }}</b>
              </article>
            </div>
            <div v-else class="is-empty">
              Chưa có report. Bắt đầu một mock interview để tạo baseline đầu tiên.
              <button type="button" @click="activeModule = 'mock'">Bắt đầu luyện →</button>
            </div>
          </section>

          <section class="is-panel is-privacy-controls" aria-label="Quản lý dữ liệu Interview Studio">
            <div class="is-panel__heading">
              <span class="is-eyebrow">DATA PRIVACY</span>
              <h2>Kiểm soát dữ liệu luyện phỏng vấn</h2>
            </div>
            <p>
              Câu trả lời, Story Bank và ghi chú evidence được lưu trong trình duyệt này.
              File xuất ra là JSON không mã hóa, cần cất giữ riêng tư.
              Hồ sơ CV và danh sách ứng tuyển/JD dùng chung với CV Studio sẽ <strong>không bị xóa</strong>
              khi xóa dữ liệu Interview Studio.
            </p>
            <div class="is-privacy-controls__actions">
              <button type="button" class="is-button" @click="exportInterviewData">Xuất dữ liệu Interview Studio (.json)</button>
              <button type="button" class="is-button is-privacy-controls__danger" @click="eraseInterviewData">Xóa dữ liệu luyện tập trên thiết bị</button>
            </div>
          </section>
        </section>
      </div>
    </section>
  </main>
</template>

<script>
import { templates } from '../data/cv'
import { patchCanonicalWorkspace, readCanonicalWorkspace } from '../data/workspace-store'
import { clearInterviewLocalData, downloadInterviewDataExport } from './interview-data-controls'
import { interviewScenarios, getInterviewScenario, scenarioPracticeQuestions } from './interview-scenarios'
import { candidateGoals, buildCandidateGrowthPlan, buildMicroPracticeSet, inferCandidateGoal } from './candidate-growth'
import {
  JOB_MARKET_AS_OF, observedJobSignals, salaryBenchmarks, verifiedEmployers,
  jobMarketSources, salaryDisplay, jobSourceForRole, isObservedJobCurrent,
} from '../data/job-market-vn'
import {
  industryPracticeProfiles,
  templateDefaultIndustry,
  interviewPacks,
  interviewSources,
  interviewStages,
  questionCategories,
  seniorityLevels,
  templateInterviewPack,
} from '../data/interview-prep'
import {
  buildQuestionDeck,
  interviewStageWeight,
  practiceContextBonus,
  resolvePracticeIndustry,
} from './question-catalog'
import {
  aggregateInterviewReport,
  analyzeApplicationEvidence,
  buildAdaptiveFollowUp,
  buildApplicationPracticeSet,
  buildInterviewStageMatrix,
  buildNextPracticePlan,
  claimProbes,
  interviewerModes,
  pressureLevels,
  evaluateInterviewResponse,
  buildAnswerImprovement,
  compareAnswerAttempts,
  snapshotAnswerInput,
  isEvaluationCurrent,
  summarizeAnswerRevisions,
  extractCvClaims,
  getUnassignedClaimNotes,
  matchQuestionsToClaim,
  migrateLegacyClaimEvidence,
  questionRelevanceScore,
  relatedClaimsForAnswer,
} from './interview-studio-engine'

const SESSION_KEY = 'interview-studio-sessions-v2'
const CLAIM_KEY = 'interview-studio-claim-evidence-v1'
const STORY_KEY = 'interview-studio-story-bank-v1'
const PREF_KEY = 'interview-studio-preferences-v1'
const GROWTH_KEY = 'interview-studio-growth-goal-v1'

export default {
  name: 'InterviewStudio',
  emits: ['back'],
  data() {
    return {
      templates,
      interviewPacks,
      interviewStages,
      questionCategories,
      seniorityLevels,
      interviewSources,
      industryPracticeProfiles,
      salaryBenchmarks,
      jobMarketSources,
      verifiedEmployers,
      observedJobSignals,
      jobMarketDate: JOB_MARKET_AS_OF,
      interviewerModes,
      pressureLevels,
      interviewScenarios,
      candidateGoals,
      growthGoalId: 'general',
      selectedScenarioId: '',
      showAllScenarios: false,
      modules: [
        { id: 'overview', label: 'Overview', icon: '◇' },
        { id: 'applications', label: 'Application Lab', icon: '◎', badge: 'JD' },
        { id: 'questions', label: 'Question Bank', icon: '?' },
        { id: 'claims', label: 'Claim Defense', icon: '⌁', badge: 'CV' },
        { id: 'stories', label: 'Story Bank', icon: '✦', badge: 'NEW' },
        { id: 'mock', label: 'Mock Interview', icon: '▶' },
        { id: 'reports', label: 'Reports', icon: '▥' },
      ],
      activeModule: 'overview',
      workspace: null,
      selectedTemplateId: templates[0]?.id || '',
      rolePackId: 'general',
      industryId: 'auto',
      seniority: 'Senior',
      stageId: 'hiring-manager',
      market: 'vietnam',
      categoryId: 'all',
      query: '',
      applicationId: '',
      applicationDraft: { id: '', company: '', role: '', status: 'Interview', jd: '', notes: '', sourceUrl: '' },
      jobMarketTab: 'jobs',
      jobMarketSearch: '',
      jobMarketCompany: 'all',
      jobMarketCity: 'all',
      jobMarketSalaryCity: 'hanoi',
      jobMarketSalaryYears: '1-5',
      showMarketExplorer: false,
      applicationStatuses: ['Saved', 'Applied', 'Screening', 'Interview', 'Technical', 'Portfolio', 'Final', 'Offer', 'Closed'],
      selectedClaimId: '',
      claimEvidence: {},
      storyBank: [],
      practiceActive: false,
      practiceQuestions: [],
      practiceIndex: 0,
      practiceDrafts: {},
      practiceShowGuide: false,
      practiceStartedAt: '',
      practiceSessions: [],
      practiceSize: 5,
      practiceBaseSize: 5,
      adaptiveInsertedCount: 0,
      interviewerMode: 'hiring-manager',
      pressureLevel: 'realistic',
      timerChoice: 90,
      timerRemaining: 90,
      timerId: null,
      timerRunning: false,
      speechRecognition: null,
      speechRecording: false,
      speechSupported: false,
    }
  },
  computed: {
    activeModuleLabel() {
      return this.modules.find((item) => item.id === this.activeModule)?.label || 'Interview Studio'
    },
    selectedTemplate() {
      return this.templates.find((template) => template.id === this.selectedTemplateId) || this.templates[0]
    },
    activePack() {
      return this.interviewPacks.find((pack) => pack.id === this.rolePackId)
        || this.interviewPacks.find((pack) => pack.id === 'general')
        || this.interviewPacks[0]
    },
    activeStageLabel() {
      return this.interviewStages.find((stage) => stage.id === this.stageId)?.label || 'Hiring Manager'
    },
    marketLabel() {
      if (this.market === 'vietnam') return 'Việt Nam'
      if (this.market === 'global') return 'Quốc tế'
      return 'VN + Quốc tế'
    },
    selectedScenario() {
      return getInterviewScenario(this.selectedScenarioId)
    },
    visibleScenarios() {
      return this.showAllScenarios ? this.interviewScenarios : this.interviewScenarios.slice(0, 5)
    },
    applications() {
      return Array.isArray(this.workspace?.ats?.applications) ? this.workspace.ats.applications : []
    },
    marketJobs() {
      const keyword = String(this.jobMarketSearch || '').trim().toLocaleLowerCase('vi')
      return this.observedJobSignals.filter((job) => {
        if (!isObservedJobCurrent(job)) return false
        if (this.jobMarketCompany !== 'all' && job.employerId !== this.jobMarketCompany) return false
        if (this.jobMarketCity !== 'all' && !job.location.toLocaleLowerCase('vi').includes(this.jobMarketCity)) return false
        const employer = this.verifiedEmployers.find(item => item.id === job.employerId)
        const target = [job.title, employer?.name, job.location].join(' ').toLocaleLowerCase('vi')
        return !keyword || target.includes(keyword)
      })
    },
    marketSalaryRoles() {
      const keyword = String(this.jobMarketSearch || '').trim().toLocaleLowerCase('vi')
      return this.salaryBenchmarks.filter(role =>
        !keyword || [role.role, role.group, ...(role.skills || [])].join(' ').toLocaleLowerCase('vi').includes(keyword))
    },
    activeApplication() {
      if (!this.applicationId) return null
      return this.applications.find((application) => application.id === this.applicationId) || null
    },
    applicationDraftAnalysis() {
      const draft = this.applicationDraft || {}
      if (![draft.company, draft.role, draft.jd].some((value) => String(value || '').trim())) return null
      return analyzeApplicationEvidence({
        application: draft,
        claims: this.cvClaims,
        stories: this.storyBank,
        questions: this.questionDeck,
      })
    },
    applicationStageMatrix() {
      if (!this.applicationDraftAnalysis) return []
      return buildInterviewStageMatrix({
        application: this.applicationDraft,
        claims: this.cvClaims,
        stories: this.storyBank,
        questions: this.questionDeck,
      })
    },
    resolvedIndustryId() {
      return resolvePracticeIndustry(this.selectedTemplateId, this.industryId)
    },
    industryOptions() {
      return [
        { id: 'auto', label: 'Auto · ' + (this.industryPracticeProfiles[this.resolvedIndustryId]?.label || 'Software / IT') },
        ...Object.entries(this.industryPracticeProfiles).map(([id, value]) => ({ id, label: value.label })),
      ]
    },
    questionDeck() {
      return buildQuestionDeck({
        templateId: this.selectedTemplateId,
        industryId: this.industryId,
        rolePackId: this.rolePackId,
        stageId: this.stageId,
        market: this.market,
      })
    },
    filteredQuestions() {
      const keyword = this.query.toLocaleLowerCase('vi')
      return this.questionDeck.filter((item) => {
        const categoryMatch = this.categoryId === 'all' || item.category === this.categoryId
        if (!categoryMatch) return false
        if (!keyword) return true
        return [
          item.question,
          item.why,
          item.example,
          ...(item.framework || []),
          ...(item.followUps || []),
          ...(item.avoid || []),
        ].join(' ').toLocaleLowerCase('vi').includes(keyword)
      })
    },
    activeSources() {
      const preferred = this.interviewSources.filter((source) => {
        const packMatch = source.packs.includes(this.rolePackId) || source.packs.includes('general')
        if (!packMatch) return false
        const region = source.region || 'global'
        if (this.market === 'vietnam') return region === 'vietnam'
        if (this.market === 'global') return region !== 'vietnam'
        return true
      })
      const seen = new Set()
      return preferred.filter((source) => {
        if (seen.has(source.id)) return false
        seen.add(source.id)
        return true
      }).slice(0, 10)
    },
    cvClaims() {
      return extractCvClaims(this.workspace?.profile || {})
    },
    selectedClaim() {
      return this.cvClaims.find((item) => item.id === this.selectedClaimId) || this.cvClaims[0] || null
    },
    selectedClaimIndex() {
      return Math.max(0, this.cvClaims.findIndex((item) => item.id === this.selectedClaim?.id))
    },
    selectedClaimProbes() {
      return claimProbes(this.selectedClaim)
    },
    selectedClaimQuestions() {
      return matchQuestionsToClaim(this.selectedClaim, this.questionDeck)
    },
    claimNote: {
      get() {
        return this.claimEvidence[this.selectedClaim?.id]?.note || ''
      },
      set(value) {
        if (!this.selectedClaim) return
        this.claimEvidence = {
          ...this.claimEvidence,
          [this.selectedClaim.id]: {
            ...(this.claimEvidence[this.selectedClaim.id] || {}),
            note: value,
          },
        }
      },
    },
    selectedClaimReady() {
      return Boolean(this.claimEvidence[this.selectedClaim?.id]?.ready)
    },
    unassignedLegacyNotes() {
      return getUnassignedClaimNotes(this.claimEvidence)
    },
    highRiskClaims() {
      return this.cvClaims.filter((item) => this.claimRisk(item) >= 70)
    },
    evidenceReadyCount() {
      return this.cvClaims.filter((item) => this.claimEvidence[item.id]?.ready).length
    },
    vietnamQuestionCount() {
      return this.questionDeck.filter((item) => item.market === 'vietnam').length
    },
    practiceCurrent() {
      return this.practiceQuestions[this.practiceIndex] || null
    },
    currentDraft() {
      return this.practiceCurrent
        ? this.practiceDrafts[this.practiceCurrent.id] || { answer: '', evidence: '', confidence: 3, evaluation: null }
        : { answer: '', evidence: '', confidence: 3, evaluation: null }
    },
    currentAnswerWords() {
      return String(this.currentDraft.answer || '').trim().split(/\s+/).filter(Boolean).length
    },
    currentImprovement() {
      return this.currentDraft.evaluation ? buildAnswerImprovement(this.currentDraft.evaluation) : null
    },
    currentRetryComparison() {
      return compareAnswerAttempts(this.currentDraft.retryBaseline?.evaluation, this.currentDraft.evaluation)
    },
    activeInterviewer() {
      return this.interviewerModes.find((item) => item.id === this.interviewerMode) || this.interviewerModes[1]
    },
    activePressure() {
      return this.pressureLevels.find((item) => item.id === this.pressureLevel) || this.pressureLevels[1]
    },
    adaptiveMaxFollowUps() {
      const base = this.practiceBaseSize <= 3 ? 1 : this.practiceBaseSize >= 8 ? 3 : 2
      return base + Number(this.activePressure?.followUpBonus || 0)
    },
    adaptiveFollowUpCount() {
      return this.practiceQuestions.filter((item) => item?.adaptive?.isFollowUp).length
    },
    nextPracticeLabel() {
      if (!String(this.currentDraft.answer || '').trim()) return 'Bỏ qua câu này →'
      const mayAdapt = !this.practiceCurrent?.adaptive?.isFollowUp
        && this.adaptiveInsertedCount < this.adaptiveMaxFollowUps
      if (mayAdapt) return 'Phân tích & tiếp tục →'
      return this.practiceIndex === this.practiceQuestions.length - 1 ? 'Hoàn tất & tạo report' : 'Câu tiếp theo →'
    },
    formattedTimer() {
      const minutes = Math.floor(this.timerRemaining / 60)
      const seconds = this.timerRemaining % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
    adaptiveFollowUps() {
      const base = this.practiceCurrent?.followUps || []
      const evaluation = this.currentDraft.evaluation
      const dynamic = []
      if (evaluation?.dimensions?.evidence < 65) dynamic.push('Evidence cụ thể nào chứng minh kết quả này? Baseline và nguồn đo là gì?')
      if (evaluation?.dimensions?.ownership < 65) dynamic.push('Phần nào anh trực tiếp sở hữu, phần nào thuộc team hoặc stakeholder khác?')
      if (evaluation?.unsupportedNumbers?.length) dynamic.push('Các con số vừa nêu có nằm trong CV hoặc tài liệu anh có thể bảo vệ không?')
      if (evaluation?.dimensions?.depth < 65) dynamic.push('Trade-off khó nhất là gì và nếu làm lại anh sẽ thay đổi quyết định nào?')
      return Array.from(new Set([...dynamic, ...base])).slice(0, 4)
    },
    latestReport() {
      return this.practiceSessions.find((session) => session.report) || null
    },
    growthPlan() {
      return buildCandidateGrowthPlan({
        sessions: this.practiceSessions,
        claims: this.cvClaims,
        claimEvidence: this.claimEvidence,
        storyBank: this.storyBank,
        goalId: this.growthGoalId,
      })
    },
    readinessSignal() {
      if (!this.latestReport) {
        const claimBase = this.cvClaims.length ? Math.round((this.evidenceReadyCount / this.cvClaims.length) * 45) : 0
        return Math.min(55, 20 + claimBase)
      }
      return Math.round(this.latestReport.report.overall * 0.78 + Math.min(22, this.evidenceReadyCount * 2))
    },
    readinessLabel() {
      const score = this.readinessSignal
      if (score >= 82) return 'Sẵn sàng luyện vòng sâu'
      if (score >= 68) return 'Nền tốt · còn evidence gaps'
      if (score >= 50) return 'Cần củng cố câu chuyện'
      return 'Chưa có đủ dữ liệu luyện tập'
    },
    totalPracticedAnswers() {
      return this.practiceSessions.reduce((sum, session) => sum + Number(session.answered || 0), 0)
    },
    storyEvidenceReadyCount() {
      return this.storyBank.filter((story) => String(story.evidence || '').trim().length >= 12).length
    },
    storyAverageScore() {
      if (!this.storyBank.length) return 0
      return Math.round(this.storyBank.reduce((sum, story) => sum + Number(story.score || 0), 0) / this.storyBank.length)
    },
    latestPracticePlan() {
      return this.latestReport?.report?.practicePlan || null
    },
    currentStorySaved() {
      if (!this.practiceCurrent) return false
      return this.storyBank.some((story) =>
        story.questionId === this.practiceCurrent.id
        && story.applicationId === (this.activeApplication?.id || '')
      )
    },
  },
  watch: {
    selectedTemplateId(nextId) {
      const mapped = templateInterviewPack[nextId]
      if (mapped) this.rolePackId = mapped
    },
    industryId() { this.savePracticePrefs() },
    seniority() { this.savePracticePrefs() },
    market() { this.savePracticePrefs() },
    selectedClaim(next) {
      if (next && !this.selectedClaimId) this.selectedClaimId = next.id
    },
    applicationId(nextId) {
      if (this.activeModule !== 'applications') return
      const application = this.applications.find((item) => item.id === nextId)
      if (application) this.editApplication(application)
    },
    stageId(next) {
      const map = {
        hr: 'recruiter',
        'hiring-manager': 'hiring-manager',
        technical: 'craft',
        portfolio: 'craft',
        final: 'executive',
      }
      if (map[next]) this.interviewerMode = map[next]
    },
    activeModule(next) {
      if (next === 'applications') {
        const application = this.activeApplication || this.applications[0]
        if (application) {
          this.applicationId = application.id
          this.editApplication(application)
        } else this.newApplication()
      }
    },
  },
  mounted() {
    this.loadPracticePrefs()
    this.workspace = readCanonicalWorkspace()
    const storedId = this.workspace?.studio?.selectedId
    if (storedId && this.templates.some((template) => template.id === storedId)) this.selectedTemplateId = storedId
    else this.rolePackId = templateInterviewPack[this.selectedTemplateId] || 'general'
    this.loadGrowthGoal()
    this.loadClaimEvidence()
    this.loadPracticeSessions()
    this.loadStoryBank()
    this.selectedClaimId = this.cvClaims[0]?.id || ''
    this.speechSupported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  },
  beforeUnmount() {
    this.stopQuestionTimer()
    this.stopDictation()
    window.speechSynthesis?.cancel()
  },
  methods: {
    loadGrowthGoal() {
      try {
        const stored = window.localStorage.getItem(GROWTH_KEY)
        if (this.candidateGoals.some(item => item.id === stored)) {
          this.growthGoalId = stored
          return
        }
      } catch { /* Storage may be unavailable. */ }
      this.growthGoalId = inferCandidateGoal({
        rolePackId: this.rolePackId,
        profileRole: this.workspace?.profile?.role || '',
        templateId: this.selectedTemplateId,
      })
    },
    setGrowthGoal(id) {
      if (!this.candidateGoals.some(item => item.id === id)) return
      this.growthGoalId = id
      try { window.localStorage.setItem(GROWTH_KEY, id) } catch { /* Optional persistence. */ }
    },
    startMicroPractice() {
      if (this.practiceActive) {
        this.activeModule = 'mock'
        return
      }
      // A 3-question rehearsal: short enough for daily repetition, built from
      // a selected role + the weakest prior response where a trusted match exists.
      this.selectedScenarioId = ''
      this.practiceSize = 3
      const selected = buildMicroPracticeSet({
        goalId: this.growthGoalId,
        sessions: this.practiceSessions,
        questions: this.questionDeck,
        count: 3,
      })
      if (!selected.length) { this.activeModule = 'mock'; return }
      this.practiceBaseSize = selected.length
      this.adaptiveInsertedCount = 0
      this.practiceQuestions = selected
      this.practiceDrafts = Object.fromEntries(selected.map(item => [
        item.id, { answer: '', evidence: '', confidence: 3, evaluation: null },
      ]))
      this.practiceIndex = 0
      this.practiceShowGuide = false
      this.practiceStartedAt = new Date().toISOString()
      this.timerChoice = 90
      this.practiceActive = true
      this.activeModule = 'mock'
      this.startQuestionTimer()
    },
    selectScenario(id) {
      this.selectedScenarioId = id
      const scenario = getInterviewScenario(id)
      if (!scenario) return
      this.stageId = scenario.stageId
      this.interviewerMode = scenario.interviewerMode
      this.pressureLevel = scenario.pressureLevel
      this.practiceSize = 5
    },
    loadPracticePrefs() {
      try {
        const saved = JSON.parse(window.localStorage.getItem(PREF_KEY) || '{}')
        if (saved && typeof saved === 'object') {
          if (saved.industryId === 'auto' || this.industryPracticeProfiles[saved.industryId]) this.industryId = saved.industryId
          if (this.seniorityLevels.includes(saved.seniority)) this.seniority = saved.seniority
          if (['vietnam', 'all', 'global'].includes(saved.market)) this.market = saved.market
        }
      } catch { /* Preferences must never block app startup. */ }
    },
    savePracticePrefs() {
      try {
        window.localStorage.setItem(PREF_KEY, JSON.stringify({
          industryId: this.industryId, seniority: this.seniority, market: this.market,
        }))
      } catch { /* Storage can be disabled or full. */ }
    },
    goHome() {
      this.$emit('back')
    },
    categoryName(id) {
      return this.questionCategories.find((category) => category.id === id)?.label || 'Role-specific'
    },
    marketEmployer(id) {
      return this.verifiedEmployers.find(item => item.id === id) || null
    },
    marketSalary(role) {
      return salaryDisplay(role, this.jobMarketSalaryCity, this.jobMarketSalaryYears)
    },
    marketSalarySource(role) {
      return jobSourceForRole(role)
    },
    useMarketJob(job) {
      const employer = this.marketEmployer(job.employerId)
      if (!employer) return
      this.newApplication()
      this.applicationDraft = {
        ...this.applicationDraft,
        company: employer.name,
        role: job.title,
        status: 'Saved',
        sourceUrl: job.sourceUrl,
        notes: 'Nguồn: ' + employer.source + ' · quan sát ' + job.checkedAt
          + (job.expiresAt ? ' · hạn đăng ' + job.expiresAt : '')
          + (job.note ? ' · ' + job.note : ''),
      }
      this.showMarketExplorer = false
    },
    dimensionLabel(key) {
      return ({
        relevance: 'Question fit',
        structure: 'Structure',
        evidence: 'Evidence',
        ownership: 'Ownership',
        depth: 'Depth',
        credibility: 'Credibility',
        delivery: 'Delivery',
      })[key] || key
    },
    stageWeight(item) {
      return interviewStageWeight(item.category, this.stageId)
    },
    contextBonus(item) {
      return practiceContextBonus(item, {
        templateId: this.selectedTemplateId,
        industryId: this.industryId,
        rolePackId: this.rolePackId,
        seniority: this.seniority,
        stageId: this.stageId,
        market: this.market,
      })
    },
    questionSources(item) {
      if (!Array.isArray(item?.sourceIds)) return []
      return item.sourceIds.map((id) => this.interviewSources.find((source) => source.id === id)).filter(Boolean)
    },
    claimRisk(item) {
      if (!item) return 0
      return Math.min(99,
        34
        + (item.numbers?.length ? 22 : 0)
        + (item.leadershipSignal ? 20 : 0)
        + (item.outcomeSignal ? 17 : 0)
        + (item.specificity >= 75 ? 8 : 0)
      )
    },
    openFirstRiskClaim() {
      this.selectedClaimId = (this.highRiskClaims[0] || this.cvClaims[0])?.id || ''
      this.activeModule = 'claims'
    },
    newApplication() {
      this.applicationId = ''
      this.applicationDraft = { id: '', company: '', role: '', status: 'Interview', jd: '', notes: '', sourceUrl: '' }
    },
    editApplication(application) {
      if (!application) return this.newApplication()
      this.applicationDraft = {
        id: application.id || '',
        company: application.company || '',
        role: application.role || '',
        status: application.status || 'Interview',
        jd: application.jd || '',
        notes: application.notes || '',
        sourceUrl: application.sourceUrl || application.url || '',
      }
    },
    saveApplication() {
      const draft = this.applicationDraft || {}
      if (!String(draft.company || '').trim() && !String(draft.role || '').trim()) return
      const id = draft.id || 'app-' + Date.now()
      const nextApplication = {
        id,
        company: String(draft.company || '').trim(),
        role: String(draft.role || '').trim(),
        status: draft.status || 'Interview',
        jd: String(draft.jd || '').trim(),
        notes: String(draft.notes || '').trim(),
        sourceUrl: String(draft.sourceUrl || '').trim(),
        updatedAt: new Date().toISOString(),
      }
      const nextApplications = this.applications.some((item) => item.id === id)
        ? this.applications.map((item) => item.id === id ? { ...item, ...nextApplication } : item)
        : [nextApplication, ...this.applications]
      this.workspace = patchCanonicalWorkspace({ ats: { applications: nextApplications } }, 'interview-studio') || this.workspace
      this.applicationId = id
      this.editApplication(nextApplication)
      return nextApplication
    },
    deleteApplication(id) {
      const nextApplications = this.applications.filter((item) => item.id !== id)
      this.workspace = patchCanonicalWorkspace({ ats: { applications: nextApplications } }, 'interview-studio') || this.workspace
      if (this.applicationId === id) this.newApplication()
    },
    practiceApplication(application = this.activeApplication || this.applicationDraft) {
      if (!application) return
      this.selectedScenarioId = ''
      let contextApplication = application
      if (!application.id) contextApplication = this.saveApplication() || application
      if (contextApplication.id) this.applicationId = contextApplication.id
      const analysis = analyzeApplicationEvidence({ application: contextApplication, claims: this.cvClaims, stories: this.storyBank, questions: this.questionDeck })
      if (analysis?.recommendedStage) this.stageId = analysis.recommendedStage
      const selected = buildApplicationPracticeSet({
        application: contextApplication,
        claims: this.cvClaims,
        stories: this.storyBank,
        questions: this.questionDeck,
        limit: this.practiceSize,
      })
      if (!selected.length) return
      this.practiceBaseSize = selected.length
      this.adaptiveInsertedCount = 0
      this.practiceQuestions = selected
      this.practiceDrafts = Object.fromEntries(selected.map((item) => [item.id, { answer: '', evidence: '', confidence: 3, evaluation: null }]))
      this.practiceIndex = 0
      this.practiceShowGuide = false
      this.practiceStartedAt = new Date().toISOString()
      this.practiceActive = true
      this.activeModule = 'mock'
      this.startQuestionTimer()
    },
    jumpToQuestion(question) {
      this.query = question.question
      this.categoryId = 'all'
      this.activeModule = 'questions'
    },
    loadClaimEvidence() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(CLAIM_KEY) || '{}')
        this.claimEvidence = migrateLegacyClaimEvidence(parsed, this.cvClaims)
      } catch {
        this.claimEvidence = {}
      }
    },
    saveClaimEvidence() {
      try {
        window.localStorage.setItem(CLAIM_KEY, JSON.stringify(this.claimEvidence))
      } catch (error) {
        console.warn('Unable to persist claim evidence.', error)
      }
    },
    saveClaimNote() {
      this.saveClaimEvidence()
    },
    assignLegacyNote(item) {
      if (!this.selectedClaim || !item || this.claimNote.trim()) return
      const notes = Array.isArray(this.claimEvidence.__legacyNotes)
        ? this.claimEvidence.__legacyNotes.map(note =>
          note.legacyId === item.legacyId ? { ...note, appliedTo: this.selectedClaim.id } : note)
        : []
      this.claimEvidence = {
        ...this.claimEvidence,
        __legacyNotes: notes,
        [this.selectedClaim.id]: {
          note: item.note,
          ready: false,
          needsReview: true,
          claimText: this.selectedClaim.text,
          legacySourceId: item.legacyId,
        },
      }
      this.saveClaimEvidence()
    },
    toggleClaimReady() {
      if (!this.selectedClaim) return
      const current = this.claimEvidence[this.selectedClaim.id] || {}
      this.claimEvidence = {
        ...this.claimEvidence,
        [this.selectedClaim.id]: { ...current, ready: !current.ready, needsReview: false, claimText: this.selectedClaim.text },
      }
      this.saveClaimEvidence()
    },
    loadStoryBank() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(STORY_KEY) || '[]')
        this.storyBank = Array.isArray(parsed) ? parsed.slice(0, 60) : []
      } catch {
        this.storyBank = []
      }
    },
    saveStoryBank() {
      this.storyBank = this.storyBank.slice(0, 60)
      try {
        window.localStorage.setItem(STORY_KEY, JSON.stringify(this.storyBank))
      } catch (error) {
        console.warn('Unable to persist Interview Studio Story Bank.', error)
      }
    },
    saveCurrentStory() {
      if (!this.practiceCurrent || !this.currentDraft?.answer) return
      if (!isEvaluationCurrent(this.currentDraft)) this.evaluateCurrent()
      const draft = this.practiceDrafts[this.practiceCurrent.id] || this.currentDraft
      const relatedClaims = relatedClaimsForAnswer(draft.answer, this.cvClaims, 3)
      const keyApplicationId = this.activeApplication?.id || ''
      const existing = this.storyBank.find((story) =>
        story.questionId === this.practiceCurrent.id
        && story.applicationId === keyApplicationId
      )
      const now = new Date().toISOString()
      const story = {
        id: existing?.id || 'story-' + Date.now(),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        questionId: this.practiceCurrent.id,
        question: this.practiceCurrent.question,
        title: relatedClaims[0]?.label || this.categoryName(this.practiceCurrent.category),
        category: this.practiceCurrent.category,
        categoryLabel: this.categoryName(this.practiceCurrent.category),
        answer: String(draft.answer || '').trim(),
        evidence: String(draft.evidence || '').trim(),
        score: Number(draft.evaluation?.overall || 0),
        strengths: draft.evaluation?.strengths || [],
        applicationId: keyApplicationId,
        contextLabel: this.activeApplication
          ? this.activeApplication.company + ' · ' + this.activeApplication.role
          : this.activePack.label,
        rolePackId: this.rolePackId,
        stageId: this.stageId,
        claims: relatedClaims.map((claim) => ({ id: claim.id, label: claim.label, text: claim.text })),
      }
      this.storyBank = existing
        ? this.storyBank.map((item) => item.id === existing.id ? story : item)
        : [story, ...this.storyBank]
      this.saveStoryBank()
    },
    deleteStory(id) {
      this.storyBank = this.storyBank.filter((story) => story.id !== id)
      this.saveStoryBank()
    },
    startStoryPractice(story) {
      const source = this.questionDeck.find((question) => question.id === story.questionId) || {
        id: story.questionId,
        question: story.question,
        why: 'Kiểm tra liệu story này có chịu được câu hỏi đào sâu khi đổi context.',
        framework: ['Kết luận', 'Ownership', 'Evidence', 'Trade-off', 'Learning'],
        example: story.answer,
        followUps: [],
        avoid: [],
        category: story.category || 'behavioral',
      }
      this.practiceBaseSize = 1
      this.adaptiveInsertedCount = 0
      this.practiceQuestions = [source]
      this.practiceDrafts = {
        [source.id]: {
          answer: story.answer || '',
          evidence: story.evidence || '',
          confidence: 4,
          evaluation: null,
        },
      }
      this.applicationId = story.applicationId || this.applicationId
      this.practiceIndex = 0
      this.practiceShowGuide = false
      this.practiceStartedAt = new Date().toISOString()
      this.practiceActive = true
      this.activeModule = 'mock'
      this.startQuestionTimer()
    },
    startPracticePlan(plan) {
      const ids = Array.isArray(plan?.recommendedQuestionIds) ? plan.recommendedQuestionIds : []
      const selected = ids
        .map((id) => this.questionDeck.find((question) => question.id === id))
        .filter(Boolean)
        .slice(0, 5)
      if (!selected.length) {
        this.practiceSize = 5
        this.startPractice()
        this.activeModule = 'mock'
        return
      }
      this.practiceBaseSize = selected.length
      this.practiceSize = selected.length
      this.adaptiveInsertedCount = 0
      this.practiceQuestions = selected
      this.practiceDrafts = Object.fromEntries(selected.map((item) => [
        item.id,
        { answer: '', evidence: '', confidence: 3, evaluation: null },
      ]))
      this.practiceIndex = 0
      this.practiceShowGuide = false
      this.practiceStartedAt = new Date().toISOString()
      this.practiceActive = true
      this.activeModule = 'mock'
      this.startQuestionTimer()
    },
    loadPracticeSessions() {
      try {
        const current = JSON.parse(window.localStorage.getItem(SESSION_KEY) || '[]')
        const legacy = JSON.parse(window.localStorage.getItem('cv-studio-interview-sessions-v1') || '[]')
        this.practiceSessions = (Array.isArray(current) && current.length ? current : Array.isArray(legacy) ? legacy : []).slice(0, 30)
      } catch {
        this.practiceSessions = []
      }
    },
    savePracticeSessions() {
      this.practiceSessions = this.practiceSessions.slice(0, 30)
      try {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(this.practiceSessions))
      } catch (error) {
        console.warn('Unable to persist Interview Studio sessions.', error)
      }
    },
    startPractice() {
      const application = this.activeApplication || {}
      const ranked = [...this.questionDeck]
        .map((question) => ({
          question,
          score: questionRelevanceScore(question, application, this.cvClaims) + this.contextBonus(question) + (8 - this.stageWeight(question)),
        }))
        .sort((a, b) => b.score - a.score)

      const selected = []
      const categories = new Set()
      ranked.forEach(({ question }) => {
        if (selected.length >= this.practiceSize) return
        if (!categories.has(question.category) || selected.length >= Math.ceil(this.practiceSize / 2)) {
          selected.push(question)
          categories.add(question.category)
        }
      })
      ranked.forEach(({ question }) => {
        if (selected.length >= this.practiceSize) return
        if (!selected.some((item) => item.id === question.id)) selected.push(question)
      })

      const scripted = scenarioPracticeQuestions(this.selectedScenarioId, this.practiceSize, selected)
      this.practiceBaseSize = scripted.length
      this.adaptiveInsertedCount = 0
      this.practiceQuestions = scripted
      this.practiceDrafts = Object.fromEntries(this.practiceQuestions.map((item) => [
        item.id,
        { answer: '', evidence: '', confidence: 3, evaluation: null },
      ]))
      this.practiceIndex = 0
      this.practiceShowGuide = false
      this.practiceStartedAt = new Date().toISOString()
      this.practiceActive = Boolean(this.practiceQuestions.length)
      this.startQuestionTimer()
    },
    startQuestionTimer() {
      this.stopQuestionTimer()
      this.timerRemaining = this.timerChoice
      this.timerRunning = true
      this.timerId = window.setInterval(() => {
        if (!this.timerRunning) return
        if (this.timerRemaining <= 1) {
          this.timerRemaining = 0
          this.timerRunning = false
          this.stopDictation()
          return
        }
        this.timerRemaining -= 1
      }, 1000)
    },
    stopQuestionTimer() {
      if (this.timerId) window.clearInterval(this.timerId)
      this.timerId = null
      this.timerRunning = false
    },
    toggleTimer() {
      if (!this.practiceActive) return
      this.timerRunning = !this.timerRunning
    },
    elapsedSeconds() {
      return Math.max(0, this.timerChoice - this.timerRemaining)
    },
    invalidateCurrentEvaluation() {
      if (!this.practiceCurrent) return
      const id = this.practiceCurrent.id
      const draft = this.practiceDrafts[id]
      if (!draft?.evaluation) return
      this.practiceDrafts = {
        ...this.practiceDrafts,
        [id]: {
          ...draft,
          retryBaseline: draft.retryBaseline || {
            ...snapshotAnswerInput(draft.evaluatedInput || draft),
            evaluation: draft.evaluation,
          },
          evaluation: null,
          evaluatedInput: null,
        },
      }
      this.practiceShowGuide = false
    },
    retryCurrentAnswer() {
      if (!this.practiceCurrent || !this.currentDraft.evaluation) return
      const id = this.practiceCurrent.id
      const current = this.practiceDrafts[id]
      this.practiceDrafts = {
        ...this.practiceDrafts,
        [id]: {
          ...current,
          retryBaseline: current.retryBaseline || {
            ...snapshotAnswerInput(current.evaluatedInput || current),
            evaluation: current.evaluation,
          },
          evaluation: null,
          evaluatedInput: null,
        },
      }
      this.practiceShowGuide = false
      this.stopQuestionTimer()
      this.$nextTick(() => this.$refs.practiceAnswer?.focus())
    },
    evaluateCurrent() {
      if (!this.practiceCurrent) return
      const id = this.practiceCurrent.id
      const draft = this.practiceDrafts[id]
      const evaluation = evaluateInterviewResponse({
        answer: draft.answer,
        evidence: draft.evidence,
        confidence: draft.confidence,
        question: this.practiceCurrent,
        claims: this.cvClaims,
        elapsedSeconds: this.elapsedSeconds(),
      })
      this.practiceDrafts = {
        ...this.practiceDrafts,
        [id]: { ...draft, evaluation, evaluatedInput: snapshotAnswerInput(draft) },
      }
      this.practiceShowGuide = Boolean(String(draft.answer || '').trim())
    },
    nextPractice() {
      if (!this.practiceCurrent) return
      if (!this.currentDraft.evaluation) this.evaluateCurrent()

      const currentQuestion = this.practiceCurrent
      const currentDraft = this.practiceDrafts[currentQuestion.id] || {}
      const canAdapt = !currentQuestion?.adaptive?.isFollowUp
        && this.adaptiveInsertedCount < this.adaptiveMaxFollowUps

      if (canAdapt) {
        const followUp = buildAdaptiveFollowUp({
          question: currentQuestion,
          evaluation: currentDraft.evaluation,
          answer: currentDraft.answer,
          claims: this.cvClaims,
          sequence: this.adaptiveInsertedCount + 1,
          interviewerMode: this.interviewerMode,
          pressureLevel: this.pressureLevel,
        })
        if (followUp && !this.practiceQuestions.some((item) => item.id === followUp.id)) {
          const nextQuestions = [...this.practiceQuestions]
          nextQuestions.splice(this.practiceIndex + 1, 0, followUp)
          this.practiceQuestions = nextQuestions
          this.practiceDrafts = {
            ...this.practiceDrafts,
            [followUp.id]: { answer: '', evidence: '', confidence: 3, evaluation: null },
          }
          this.adaptiveInsertedCount += 1
        }
      }

      if (this.practiceIndex < this.practiceQuestions.length - 1) {
        this.stopDictation()
        this.practiceIndex += 1
        this.practiceShowGuide = false
        this.startQuestionTimer()
        return
      }
      this.finishPractice()
    },
    finishPractice() {
      this.stopQuestionTimer()
      this.stopDictation()
      const responses = this.practiceQuestions.map((item) => {
        const draft = this.practiceDrafts[item.id] || {}
        const evaluation = isEvaluationCurrent(draft) ? draft.evaluation : evaluateInterviewResponse({
          answer: draft.answer,
          evidence: draft.evidence,
          confidence: draft.confidence,
          question: item,
          claims: this.cvClaims,
          elapsedSeconds: this.timerChoice,
        })
        return {
          questionId: item.id,
          question: item.question,
          answer: String(draft.answer || '').trim(),
          evidence: String(draft.evidence || '').trim(),
          confidence: Number(draft.confidence || 0),
          evaluation,
          retryBefore: draft.retryBaseline?.evaluation?.overall ?? null,
          adaptive: item.adaptive || null,
        }
      })
      const report = aggregateInterviewReport(responses)
      report.revisions = summarizeAnswerRevisions(responses)
      report.practicePlan = buildNextPracticePlan({
        report,
        responses,
        questions: this.questionDeck,
        claims: this.cvClaims,
        application: this.activeApplication || {},
      })
      const session = {
        id: 'interview-studio-' + Date.now(),
        createdAt: new Date().toISOString(),
        startedAt: this.practiceStartedAt,
        applicationId: this.activeApplication?.id || '',
        contextLabel: this.activeApplication
          ? this.activeApplication.company + ' · ' + this.activeApplication.role
          : this.activePack.label + ' · ' + (this.selectedTemplate?.name || 'CV'),
        rolePackId: this.rolePackId,
        growthGoalId: this.growthGoalId,
        scenarioId: this.selectedScenarioId || '',
        scenarioLabel: this.selectedScenario?.label || '',
        seniority: this.seniority,
        stageId: this.stageId,
        stageLabel: this.activeStageLabel,
        market: this.market,
        interviewerMode: this.interviewerMode,
        interviewerLabel: this.activeInterviewer?.label || this.interviewerMode,
        pressureLevel: this.pressureLevel,
        pressureLabel: this.activePressure?.label || this.pressureLevel,
        total: responses.length,
        baseQuestions: this.practiceBaseSize,
        adaptiveFollowUps: responses.filter((item) => item.adaptive?.isFollowUp).length,
        answered: responses.filter((item) => item.answer).length,
        evidenceReady: responses.filter((item) => item.answer && item.evidence.length >= 12).length,
        responses,
        report,
      }
      this.practiceSessions = [session, ...this.practiceSessions]
      this.savePracticeSessions()
      this.practiceActive = false
      if (this.practiceSize === 3) this.practiceSize = 5
      this.activeModule = 'reports'
    },
    clearPracticeHistory() {
      this.practiceSessions = []
      this.savePracticeSessions()
    },
    exportInterviewData() {
      try {
        downloadInterviewDataExport(window.localStorage, document, URL, Blob)
      } catch (error) {
        console.warn('Unable to export Interview Studio data.', error)
        window.alert('Không thể xuất dữ liệu lúc này. Hãy kiểm tra quyền truy cập bộ nhớ trình duyệt.')
      }
    },
    eraseInterviewData() {
      if (!window.confirm('Xóa toàn bộ lịch sử luyện tập, Story Bank, ghi chú Claim Defense và thiết lập Interview Studio trên thiết bị này? CV và các JD dùng chung sẽ được giữ lại.')) return
      try {
        clearInterviewLocalData(window.localStorage)
        this.stopQuestionTimer()
        this.stopDictation()
        this.practiceActive = false
        this.practiceQuestions = []
        this.practiceDrafts = {}
        this.practiceSessions = []
        this.claimEvidence = {}
        this.storyBank = []
        // Keep current in-memory selectors. Their watchers persist changes,
        // so resetting them here would recreate preferences after deletion.
      } catch (error) {
        console.warn('Unable to clear Interview Studio data.', error)
        window.alert('Không thể xóa hết dữ liệu trong trình duyệt này.')
      }
    },
    formatSessionDate(value) {
      try {
        return new Intl.DateTimeFormat('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(value))
      } catch {
        return value
      }
    },
    speakQuestion() {
      if (!this.practiceCurrent || !window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(this.practiceCurrent.question)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.96
      window.speechSynthesis.speak(utterance)
    },
    toggleDictation() {
      if (this.speechRecording) this.stopDictation()
      else this.startDictation()
    },
    startDictation() {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!Recognition || !this.practiceCurrent) return
      this.stopDictation()
      const recognition = new Recognition()
      recognition.lang = 'vi-VN'
      recognition.continuous = true
      recognition.interimResults = true
      let committed = ''
      const baseAnswer = String(this.currentDraft.answer || '').replace(/\s*\[đang nghe:.*$/s, '').trim()
      recognition.onresult = (event) => {
        this.invalidateCurrentEvaluation()
        let interim = ''
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const transcript = event.results[index][0]?.transcript || ''
          if (event.results[index].isFinal) committed += transcript + ' '
          else interim += transcript
        }
        const id = this.practiceCurrent?.id
        if (!id) return
        const draft = this.practiceDrafts[id] || {}
        const next = [baseAnswer, committed.trim()].filter(Boolean).join(' ')
        this.practiceDrafts = {
          ...this.practiceDrafts,
          [id]: {
            ...draft,
            answer: interim ? `${next} [đang nghe: ${interim}]` : next,
          },
        }
      }
      recognition.onerror = () => {
        this.speechRecording = false
      }
      recognition.onend = () => {
        this.invalidateCurrentEvaluation()
        this.speechRecording = false
        const id = this.practiceCurrent?.id
        if (!id) return
        const draft = this.practiceDrafts[id] || {}
        this.practiceDrafts = {
          ...this.practiceDrafts,
          [id]: {
            ...draft,
            answer: String(draft.answer || '').replace(/\s*\[đang nghe:.*$/s, '').trim(),
          },
        }
      }
      this.speechRecognition = recognition
      this.speechRecording = true
      recognition.start()
    },
    stopDictation() {
      if (this.speechRecognition) {
        try { this.speechRecognition.stop() } catch {}
      }
      this.speechRecognition = null
      this.speechRecording = false
    },
  },
}
</script>

<style scoped lang="scss">
.is-shell {
  --ink: #173044;
  --muted: #506779;
  --faint: #687f8e;
  --line: rgba(24, 74, 94, .16);
  --surface: #ffffff;
  --surface-2: #f5f9fb;
  --surface-3: #eaf3f6;
  --accent: #087a70;
  --accent-2: #285faf;
  --warning: #a26716;
  --danger: #b93b50;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 238px minmax(0, 1fr);
  color: var(--ink);
  background:
    radial-gradient(circle at 82% 3%, rgba(114, 231, 212, .08), transparent 27%),
    radial-gradient(circle at 34% 90%, rgba(157, 183, 255, .05), transparent 30%),
    #f6f9fc;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
}

.is-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: rgba(255,255,255,.96);
  backdrop-filter: blur(24px);
}

.is-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 4px 8px 24px;
  color: inherit;
  text-decoration: none;

  strong, small { display: block; }
  strong { font-size: 14px; letter-spacing: -.02em; }
  small { margin-top: 3px; color: var(--muted); font-size: 10px; }
}

.is-brand__mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(114, 231, 212, .35);
  border-radius: 12px;
  color: #ffffff;
  background: var(--accent);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: -.03em;
  box-shadow: 0 8px 28px rgba(114, 231, 212, .12);
}

.is-nav {
  display: grid;
  gap: 5px;

  button {
    min-height: 45px;
    padding: 0 10px;
    display: grid;
    grid-template-columns: 28px 1fr auto;
    gap: 8px;
    align-items: center;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: 12px;
    text-align: left;
    cursor: pointer;
  }

  button:hover { background: rgba(8,122,112,.055); color: var(--ink); }
  button.active {
    background: rgba(114, 231, 212, .09);
    color: var(--accent);
    box-shadow: inset 2px 0 0 var(--accent);
  }

  b {
    padding: 2px 5px;
    border-radius: 5px;
    background: rgba(157, 183, 255, .1);
    color: var(--accent-2);
    font-size: 9px;
  }
}

.is-nav__icon {
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 7px;
  font-size: 11px;
}

.is-sidebar__context {
  margin-top: auto;
  padding: 16px 10px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);

  > strong { display: block; margin-top: 9px; font-size: 13px; }
  > p { margin: 4px 0 11px; color: var(--muted); font-size: 10px; line-height: 1.45; }
  > div { display: flex; flex-wrap: wrap; gap: 5px; }
  > div span {
    padding: 4px 6px;
    border-radius: 6px;
    background: rgba(8,122,112,.07);
    color: var(--muted);
    font-size: 9px;
  }
}

.is-sidebar__footer {
  padding: 15px 8px 0;
  display: flex;
  justify-content: space-between;
  gap: 8px;

  a, button {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: 10px;
    text-decoration: none;
    cursor: pointer;
  }

  a:hover, button:hover { color: var(--accent); }
}

.is-stage { min-width: 0; }

.is-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  min-height: 68px;
  padding: 10px clamp(20px, 3vw, 44px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid var(--line);
  background: rgba(255,255,255,.96);
  backdrop-filter: blur(22px);

  > div:first-child {
    min-width: 0;
    display: grid;
    grid-template-columns: 9px auto 1fr;
    gap: 8px;
    align-items: center;

    > span:not(.is-topbar__dot) { font-size: 12px; font-weight: 700; }
    small { overflow: hidden; color: var(--muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  }
}

.is-topbar__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 14px rgba(114,231,212,.7);
}

.is-topbar__actions {
  display: flex;
  gap: 8px;
  align-items: center;

  select {
    max-width: 260px;
    min-height: 38px;
    padding: 0 32px 0 10px;
    border: 1px solid var(--line);
    border-radius: 9px;
    color: var(--muted);
    background: var(--surface);
    font: inherit;
    font-size: 10px;
  }
}

.is-command {
  min-height: 38px;
  padding: 0 13px;
  border: 0;
  border-radius: 9px;
  background: var(--accent);
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
}

.is-content {
  width: min(1500px, 100%);
  margin: 0 auto;
  padding: 42px clamp(20px, 4vw, 58px) 100px;
}

.is-view { animation: is-enter 220ms ease both; }

@keyframes is-enter {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.is-eyebrow {
  color: var(--accent);
  font-size: 9px;
  font-weight: 780;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.is-hero {
  min-height: 430px;
  padding: clamp(38px, 5vw, 72px) 0 46px;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, .6fr);
  gap: clamp(50px, 8vw, 120px);
  align-items: end;

  h1 {
    max-width: 15ch;
    margin: 16px 0 24px;
    font-size: clamp(48px, 6.3vw, 88px);
    line-height: .94;
    letter-spacing: -.062em;
    font-weight: 690;
  }

  h1 em { color: var(--accent); font-style: normal; font-weight: 520; }

  > div > p {
    max-width: 65ch;
    margin: 0;
    color: var(--muted);
    font-size: 16px;
    line-height: 1.65;
  }
}

.is-hero__actions { margin-top: 28px; display: flex; flex-wrap: wrap; gap: 9px; }

.is-button {
  min-height: 42px;
  padding: 0 15px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(8,122,112,.055);
  color: var(--ink);
  font: inherit;
  font-size: 11px;
  font-weight: 720;
  cursor: pointer;
}

.is-button--primary {
  border-color: transparent;
  background: var(--accent);
  color: #ffffff;
}

.is-readiness {
  padding: 25px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(114,231,212,.08), rgba(255,255,255,.02));

  > div:first-child { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
  > div:first-child span { color: var(--muted); font-size: 9px; font-weight: 720; letter-spacing: .1em; }
  > div:first-child b { color: var(--accent); font-size: 42px; letter-spacing: -.05em; }
  > strong { display: block; margin-top: 22px; font-size: 18px; }
  > p { margin: 7px 0 22px; color: var(--muted); font-size: 11px; line-height: 1.5; }
}

.is-readiness__bar {
  height: 5px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(32,88,103,.10);

  span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent-2), var(--accent)); }
}

.is-stat-grid {
  margin-bottom: 22px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);

  article {
    padding: 22px 20px;
    border-right: 1px solid var(--line);
  }
  article:last-child { border-right: 0; }
  span, small, b { display: block; }
  span { color: var(--muted); font-size: 10px; }
  b { margin: 12px 0 5px; font-size: 30px; letter-spacing: -.04em; }
  small { color: var(--faint); font-size: 9px; line-height: 1.4; }
}

.is-overview-grid,
.is-report-grid {
  margin-bottom: 22px;
  display: grid;
  grid-template-columns: 1.15fr .85fr;
  gap: 18px;
}

.is-panel {
  padding: 25px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgba(255,255,255,.98);
}

.is-panel__heading {
  margin-bottom: 21px;

  h2 { margin: 8px 0 0; font-size: 19px; letter-spacing: -.025em; }
}

.is-panel__heading--split { display: flex; justify-content: space-between; gap: 18px; align-items: end; }

.is-context-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 11px;

  label, .is-filterbar label, .is-mock-config label {
    display: grid;
    gap: 6px;
  }

  label > span, .is-filterbar label > span, .is-mock-config label > span {
    color: var(--muted);
    font-size: 9px;
    font-weight: 650;
  }
}

.is-shell select,
.is-shell input[type="search"],
.is-shell textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: #f5f9fb;
  color: var(--ink);
  font: inherit;
}

.is-shell select { min-height: 40px; padding: 0 10px; font-size: 10px; }
.is-shell textarea { padding: 13px; resize: vertical; font-size: 12px; line-height: 1.55; }
.is-shell input[type="search"] { min-height: 42px; padding: 0 12px; font-size: 11px; }

.is-shell select:focus-visible,
.is-shell textarea:focus-visible,
.is-shell input:focus-visible,
.is-shell button:focus-visible,
.is-shell a:focus-visible,
.is-shell summary:focus-visible {
  outline: 2px solid rgba(114,231,212,.55);
  outline-offset: 2px;
}

.is-signal {
  margin-top: 18px;
  padding-top: 17px;
  border-top: 1px solid var(--line);

  > span { color: var(--accent-2); font-size: 9px; font-weight: 780; letter-spacing: .1em; }
  strong { display: block; margin-top: 8px; font-size: 12px; line-height: 1.5; }
  p { margin: 5px 0 0; color: var(--muted); font-size: 10px; line-height: 1.5; }
}

.is-action-list {
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding: 15px 0;
    display: grid;
    grid-template-columns: 30px 1fr auto;
    gap: 12px;
    align-items: start;
    border-top: 1px solid var(--line);
  }

  li:first-child { border-top: 0; }
  li > b { color: var(--accent); font-size: 9px; }
  strong { display: block; font-size: 11px; }
  p { margin: 4px 0 0; color: var(--muted); font-size: 9px; line-height: 1.5; }
  button { padding: 0; border: 0; background: transparent; color: var(--accent); font: inherit; font-size: 9px; cursor: pointer; }
}

.is-source-status {
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(114,231,212,.08);
  color: var(--accent);
  font-size: 9px;
}

.is-source-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);

  a {
    min-height: 150px;
    padding: 15px;
    display: block;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    color: inherit;
    text-decoration: none;
  }

  a:hover { background: rgba(114,231,212,.035); }
  a > span { display: inline-flex; padding: 3px 5px; border-radius: 5px; background: rgba(157,183,255,.09); color: var(--accent-2); font-size: 8px; }
  strong, small { display: block; }
  strong { margin-top: 12px; font-size: 11px; }
  small { margin-top: 3px; color: var(--muted); font-size: 9px; }
  p { margin: 10px 0 0; color: var(--faint); font-size: 9px; line-height: 1.45; }
}

.is-page-heading {
  min-height: 250px;
  padding: 28px 0 44px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 44px;
  border-bottom: 1px solid var(--line);

  h1 {
    max-width: 18ch;
    margin: 13px 0 16px;
    font-size: clamp(38px, 5vw, 66px);
    line-height: .98;
    letter-spacing: -.052em;
    font-weight: 650;
  }

  h1 em { color: var(--accent); font-style: normal; font-weight: 520; }
  p { max-width: 70ch; margin: 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
}

.is-heading-number { color: rgba(114,231,212,.16); font-size: clamp(70px, 10vw, 150px); line-height: .75; font-weight: 780; letter-spacing: -.07em; }

.is-filterbar {
  padding: 18px 0;
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 190px 170px;
  gap: 10px;
  border-bottom: 1px solid var(--line);

  label { display: grid; gap: 6px; }
  label > span { color: var(--muted); font-size: 9px; }
}

.is-question-grid { padding-top: 18px; display: grid; gap: 8px; }

.is-question {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(255,255,255,.98);

  summary {
    min-height: 72px;
    padding: 15px 18px;
    display: grid;
    grid-template-columns: 32px 1fr 22px;
    gap: 12px;
    align-items: center;
    list-style: none;
    cursor: pointer;
  }

  summary::-webkit-details-marker { display: none; }
  summary small { display: block; margin-bottom: 4px; color: var(--muted); font-size: 8px; letter-spacing: .08em; text-transform: uppercase; }
  summary small b { margin-left: 7px; color: var(--accent); font-size: 7px; }
  summary strong { font-size: 13px; line-height: 1.4; }
}

.is-question__number { color: var(--faint); font-size: 9px; }
.is-question__plus { color: var(--accent); font-size: 18px; transition: transform 160ms ease; }
.is-question[open] .is-question__plus { transform: rotate(45deg); }

.is-question__body {
  padding: 0 18px 20px 62px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  section { padding-top: 14px; border-top: 1px solid var(--line); }
  section > span { display: block; margin-bottom: 7px; color: var(--accent-2); font-size: 8px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
  p, li { color: var(--muted); font-size: 10px; line-height: 1.55; }
  p { margin: 0; }
  ol, ul { margin: 0; padding-left: 16px; }
}

.is-question__example,
.is-question__sources { grid-column: 1 / -1; }
.is-question__example p { max-width: 80ch; color: var(--ink); font-size: 11px; }
.is-question__avoid li::marker { color: var(--danger); }
.is-question__sources > div { display: flex; flex-wrap: wrap; gap: 7px 12px; }
.is-question__sources a { color: var(--accent); font-size: 9px; text-decoration: none; }

.is-claim-layout {
  padding-top: 20px;
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 18px;
}

.is-claim-list {
  max-height: calc(100vh - 120px);
  overflow: auto;
  display: grid;
  align-content: start;
  gap: 6px;

  button {
    padding: 13px;
    display: grid;
    grid-template-columns: 1fr 38px;
    gap: 10px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: rgba(255,255,255,.98);
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  button.active { border-color: rgba(114,231,212,.38); background: rgba(114,231,212,.06); }
  small { display: block; margin-bottom: 6px; color: var(--faint); font-size: 8px; text-transform: uppercase; }
  strong { display: -webkit-box; overflow: hidden; font-size: 10px; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
  b { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; background: rgba(157,183,255,.08); color: var(--accent-2); font-size: 9px; }
  b.high { background: rgba(243,200,106,.09); color: var(--warning); }
}

.is-claim-detail {
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255,255,255,.98);
}

.is-claim-detail__header {
  display: grid;
  grid-template-columns: 1fr 90px;
  gap: 28px;
  align-items: start;

  h2 { max-width: 34ch; margin: 10px 0 0; font-size: clamp(24px, 3vw, 40px); line-height: 1.1; letter-spacing: -.035em; }
}

.is-risk-ring {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  align-content: center;
  border: 1px solid rgba(243,200,106,.26);
  border-radius: 50%;
  background: rgba(243,200,106,.04);

  b { color: var(--warning); font-size: 26px; }
  span { margin-top: 2px; color: var(--muted); font-size: 8px; }
}

.is-legacy-notes {
  > p { margin: 9px 0 12px; color: var(--muted); font-size: 10px; line-height: 1.55; }
  article {
    padding: 12px;
    margin-top: 7px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: #f5f9fb;
  }
  article small { color: var(--accent-2); font-size: 9px; }
  article p { margin: 7px 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 11px; line-height: 1.5; }
  article button {
    min-height: 32px;
    padding: 0 10px;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: transparent;
    color: var(--accent);
    cursor: pointer;
  }
  article button:disabled { opacity: .45; cursor: not-allowed; }
}
.is-claim-meta { margin: 22px 0; display: flex; flex-wrap: wrap; gap: 6px; }
.is-claim-meta span { padding: 5px 7px; border-radius: 6px; background: rgba(8,122,112,.055); color: var(--muted); font-size: 8px; }

.is-claim-section { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--line); }

.is-probe-list {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  counter-reset: probes;

  li {
    padding: 13px 0;
    display: grid;
    grid-template-columns: 26px 1fr;
    gap: 10px;
    border-top: 1px solid var(--line);
    color: var(--ink);
    font-size: 11px;
    line-height: 1.5;
    counter-increment: probes;
  }
  li:first-child { border-top: 0; }
  li::before { content: "0" counter(probes); color: var(--accent); font-size: 8px; }
}

.is-matched-questions { margin-top: 12px; display: grid; gap: 6px; }
.is-matched-questions button {
  padding: 12px;
  display: grid;
  grid-template-columns: 90px 1fr 20px;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: #f5f9fb;
  color: inherit;
  text-align: left;
  cursor: pointer;

  span { color: var(--muted); font-size: 8px; }
  strong { font-size: 10px; line-height: 1.45; }
  b { color: var(--accent); }
}

.is-claim-note-footer { margin-top: 9px; display: flex; justify-content: space-between; gap: 10px; align-items: center; }
.is-claim-note-footer > span { color: var(--faint); font-size: 8px; }
.is-claim-note-footer button { min-height: 34px; padding: 0 10px; border: 1px solid var(--line); border-radius: 8px; background: transparent; color: var(--muted); font: inherit; font-size: 9px; cursor: pointer; }
.is-claim-note-footer button.ready { border-color: rgba(114,231,212,.3); color: var(--accent); background: rgba(114,231,212,.06); }

.is-mock-start {
  padding-top: 24px;
  display: grid;
  grid-template-columns: 1.15fr .85fr;
  gap: 18px;
}

.is-mock-config,
.is-mock-preview {
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255,255,255,.98);
}

.is-mock-config {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  > div { grid-column: 1 / -1; margin-bottom: 10px; }
  h2 { margin: 8px 0 0; font-size: 24px; letter-spacing: -.03em; }
  label { display: grid; gap: 6px; }
  label > span { color: var(--muted); font-size: 9px; }
}

.is-mock-preview {
  display: grid;
  gap: 0;

  > span { margin-bottom: 8px; }
  > div {
    padding: 14px 0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    border-top: 1px solid var(--line);
  }
  > div b { font-size: 18px; }
  > div span { color: var(--muted); font-size: 9px; }
  > button { margin-top: 18px; width: 100%; }
}

.is-live-session {
  max-width: 1050px;
  margin: 26px auto 0;
  padding: clamp(24px, 4vw, 46px);
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255,255,255,.98);

  > h2 {
    max-width: 28ch;
    margin: 36px 0 22px;
    font-size: clamp(28px, 4vw, 46px);
    line-height: 1.08;
    letter-spacing: -.04em;
  }
}

.is-live-session__meta {
  display: flex;
  justify-content: space-between;
  gap: 20px;

  > div:first-child span, > div:first-child small { display: block; }
  > div:first-child span { color: var(--accent); font-size: 9px; font-weight: 780; letter-spacing: .1em; }
  > div:first-child small { margin-top: 5px; color: var(--muted); font-size: 9px; }
}

.is-timer {
  text-align: right;

  b, span { display: block; }
  b { color: var(--accent); font-size: 28px; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
  span { color: var(--muted); font-size: 8px; }
}
.is-timer.warning b { color: var(--warning); }

.is-adaptive-badge {
  margin-left: 8px;
  padding: 3px 6px;
  border-radius: 999px;
  background: rgba(243,200,106,.1);
  color: var(--warning);
  font-size: 7px;
  letter-spacing: .08em;
}

.is-adaptive-reason {
  margin-top: 24px;
  padding: 13px 15px;
  border-left: 2px solid var(--warning);
  background: rgba(243,200,106,.045);

  span { color: var(--warning); font-size: 8px; font-weight: 780; letter-spacing: .1em; }
  p { margin: 6px 0 3px; color: var(--ink); font-size: 10px; line-height: 1.5; }
  small { color: var(--muted); font-size: 8px; }
}

.is-adaptive-report { margin-bottom: 18px; }
.is-adaptive-report__stats {
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 8px;

  div { padding: 12px; border: 1px solid var(--line); border-radius: 9px; background: #f5f9fb; }
  b, span { display: block; }
  b { color: var(--accent); font-size: 22px; }
  span { margin-top: 3px; color: var(--muted); font-size: 8px; }
}

.is-live-session__tools { margin-bottom: 17px; display: flex; flex-wrap: wrap; gap: 6px; }
.is-live-session__tools button,
.is-coach-toggle {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 9px;
  cursor: pointer;
}
.is-live-session__tools button:disabled { opacity: .4; cursor: not-allowed; }
.is-live-session__tools button.recording { border-color: rgba(255,130,124,.35); color: var(--danger); }

.is-answer-grid {
  display: grid;
  grid-template-columns: 1.25fr .75fr;
  gap: 10px;

  label { display: grid; gap: 7px; }
  label > span { color: var(--muted); font-size: 9px; font-weight: 680; }
  label > small { color: var(--faint); font-size: 8px; line-height: 1.4; }
}

.is-confidence {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 100px 1fr 38px;
  gap: 10px;
  align-items: center;

  > span { color: var(--muted); font-size: 9px; }
  input { accent-color: var(--accent); }
  b { font-size: 10px; }
}

.is-evaluation {
  margin-top: 20px;
  padding: 18px;
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 20px;
  border: 1px solid rgba(114,231,212,.15);
  border-radius: 12px;
  background: rgba(114,231,212,.035);

  > ul { grid-column: 1 / -1; margin: 0; padding-left: 17px; color: var(--warning); }
  > ul li { margin-top: 5px; font-size: 9px; line-height: 1.45; }
}

.is-evaluation__score {
  display: grid;
  place-items: center;
  align-content: center;
  border-right: 1px solid var(--line);

  b { color: var(--accent); font-size: 42px; letter-spacing: -.05em; }
  span { color: var(--muted); font-size: 8px; }
}

.is-evaluation__bars,
.is-report-bars {
  display: grid;
  gap: 7px;

  > div { display: grid; grid-template-columns: 82px 1fr 28px; gap: 8px; align-items: center; }
  > div > span { color: var(--muted); font-size: 8px; }
  > div > i { height: 4px; overflow: hidden; border-radius: 99px; background: rgba(32,88,103,.09); }
  > div > i > b { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent-2), var(--accent)); }
  > div > strong { text-align: right; font-size: 8px; }
}

.is-coach-toggle { margin-top: 15px; color: var(--accent); }

.is-coach-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  section { padding: 13px; border: 1px solid var(--line); border-radius: 9px; background: #f5f9fb; }
  section > span { color: var(--accent-2); font-size: 8px; font-weight: 750; text-transform: uppercase; }
  p, li { color: var(--muted); font-size: 9px; line-height: 1.5; }
  p { margin: 7px 0 0; }
  ol, ul { margin: 7px 0 0; padding-left: 15px; }
}

.is-session-actions {
  margin-top: 22px;
  padding-top: 17px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--line);
}

.is-story-stats {
  margin: 22px 0 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);

  article { padding: 18px; border-right: 1px solid var(--line); }
  article:last-child { border-right: 0; }
  span, b, small { display: block; }
  span { color: var(--muted); font-size: 9px; }
  b { margin: 9px 0 4px; color: var(--accent); font-size: 27px; }
  small { color: var(--faint); font-size: 8px; }
}

.is-story-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.is-story-card {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255,255,255,.98);
}

.is-story-card__top {
  display: grid;
  grid-template-columns: 1fr 44px;
  gap: 14px;
  align-items: start;

  span { color: var(--muted); font-size: 8px; }
  h2 { margin: 6px 0 0; font-size: 18px; letter-spacing: -.025em; }
  > b { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%; background: rgba(114,231,212,.08); color: var(--accent); font-size: 12px; }
}

.is-story-card__question { margin: 17px 0 10px; color: var(--accent-2); font-size: 10px; line-height: 1.5; }
.is-story-card blockquote { margin: 0; color: var(--ink); font-size: 11px; line-height: 1.65; }
.is-story-evidence { margin-top: 15px; padding-top: 13px; border-top: 1px solid var(--line); }
.is-story-evidence span { color: var(--accent); font-size: 8px; font-weight: 750; letter-spacing: .08em; }
.is-story-evidence p { margin: 7px 0 0; color: var(--muted); font-size: 9px; line-height: 1.55; }
.is-story-claims { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 5px; }
.is-story-claims span { padding: 4px 6px; border-radius: 6px; background: rgba(157,183,255,.08); color: var(--accent-2); font-size: 8px; }
.is-story-card__footer { margin-top: 17px; padding-top: 13px; display: flex; justify-content: space-between; gap: 12px; align-items: center; border-top: 1px solid var(--line); }
.is-story-card__footer small { color: var(--faint); font-size: 8px; }
.is-story-card__footer > div { display: flex; gap: 9px; }
.is-story-card__footer button { padding: 0; border: 0; background: transparent; color: var(--accent); font: inherit; font-size: 9px; cursor: pointer; }
.is-story-card__footer button.danger { color: var(--danger); }
.is-button--story.saved { border-color: rgba(114,231,212,.28); color: var(--accent); background: rgba(114,231,212,.06); }

.is-practice-plan { margin-bottom: 18px; }
.is-practice-plan__focus { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.is-practice-plan__focus article { padding: 13px; border: 1px solid var(--line); border-radius: 10px; background: #f5f9fb; }
.is-practice-plan__focus article > div { display: flex; justify-content: space-between; gap: 10px; }
.is-practice-plan__focus strong { font-size: 10px; }
.is-practice-plan__focus b { color: var(--warning); font-size: 10px; }
.is-practice-plan__focus p { margin: 8px 0 0; color: var(--muted); font-size: 9px; line-height: 1.5; }
.is-practice-plan__questions,
.is-practice-plan__claims { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line); }
.is-practice-plan__questions ol { margin: 10px 0 0; padding-left: 18px; color: var(--muted); }
.is-practice-plan__questions li { margin: 7px 0; font-size: 9px; line-height: 1.45; }
.is-practice-plan__claims > div { margin-top: 10px; display: grid; gap: 6px; }
.is-practice-plan__claims > div span { padding: 8px 10px; border-radius: 8px; background: rgba(243,200,106,.045); color: var(--muted); font-size: 9px; line-height: 1.45; }

.is-report-hero {
  margin: 24px 0 18px;
  padding: 24px;
  display: grid;
  grid-template-columns: 145px 1fr;
  gap: 24px;
  align-items: center;
  border: 1px solid rgba(114,231,212,.18);
  border-radius: 14px;
  background: linear-gradient(100deg, rgba(114,231,212,.07), rgba(157,183,255,.025));

  > div:last-child strong { font-size: 20px; }
  > div:last-child p { margin: 6px 0; color: var(--muted); font-size: 10px; }
  > div:last-child span { color: var(--accent); font-size: 9px; }
}

.is-report-score {
  padding-right: 24px;
  border-right: 1px solid var(--line);
  text-align: center;

  span { display: block; color: var(--muted); font-size: 7px; letter-spacing: .08em; }
  b { color: var(--accent); font-size: 58px; letter-spacing: -.07em; }
  small { color: var(--muted); font-size: 9px; }
}

.is-branch-trace__list {
  display: grid;
  border-top: 1px solid var(--line);
}

.is-branch-trace__list article {
  padding: 15px 0;
  display: grid;
  grid-template-columns: 34px 1fr 92px;
  gap: 14px;
  align-items: start;
  border-bottom: 1px solid var(--line);
}

.is-branch-trace__index {
  color: var(--accent);
  font-size: 9px;
  font-variant-numeric: tabular-nums;
}

.is-branch-trace__list article > div:nth-child(2) > span {
  display: block;
  margin-bottom: 5px;
  color: var(--muted);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.is-branch-trace__list article strong {
  display: block;
  font-size: 11px;
  line-height: 1.45;
}

.is-branch-trace__list article p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 9px;
  line-height: 1.5;
}

.is-branch-trace__trigger {
  text-align: right;
}

.is-branch-trace__trigger span,
.is-branch-trace__trigger b {
  display: block;
}

.is-branch-trace__trigger span {
  color: var(--muted);
  font-size: 8px;
}

.is-branch-trace__trigger b {
  margin-top: 4px;
  color: var(--warning);
  font-size: 18px;
}

.is-privacy-controls {
  margin-top: 20px;
  > p { max-width: 80ch; color: var(--muted); font-size: 11px; line-height: 1.65; }
}
.is-privacy-controls__actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 15px; }
.is-privacy-controls__danger { color: var(--danger); border-color: rgba(255,130,124,.25); }
.is-warning-list { margin: 0; padding: 0; list-style: none; }
.is-warning-list li { padding: 11px 0 11px 20px; position: relative; border-top: 1px solid var(--line); color: var(--muted); font-size: 9px; line-height: 1.5; }
.is-warning-list li::before { content: "!"; position: absolute; left: 0; color: var(--warning); font-weight: 800; }

.is-text-button { padding: 0; border: 0; background: transparent; color: var(--muted); font: inherit; font-size: 9px; cursor: pointer; }

.is-history-table {
  border-top: 1px solid var(--line);

  article {
    padding: 13px 0;
    display: grid;
    grid-template-columns: 1.3fr .75fr .6fr .55fr 42px;
    gap: 12px;
    align-items: center;
    border-bottom: 1px solid var(--line);
  }

  strong, small { display: block; }
  strong { font-size: 10px; }
  small { margin-top: 3px; color: var(--faint); font-size: 8px; }
  article > span { color: var(--muted); font-size: 9px; }
  article > b { color: var(--accent); text-align: right; font-size: 12px; }
}

.is-empty { padding: 36px; text-align: center; color: var(--muted); font-size: 10px; }
.is-empty button { display: block; margin: 12px auto 0; border: 0; background: transparent; color: var(--accent); cursor: pointer; }

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}







@media (prefers-reduced-motion: reduce) {
  .is-view, .is-question__plus { animation: none; transition: none; }
}

.is-application-layout {
  padding-top: 22px;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 18px;
}

.is-application-list {
  display: grid;
  align-content: start;
  gap: 7px;
}

.is-application-list__head {
  padding: 0 2px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  button {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--accent);
    font: inherit;
    font-size: 10px;
    cursor: pointer;
  }
}

.is-application-list > button {
  min-height: 84px;
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr 20px;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: rgba(255,255,255,.98);
  color: inherit;
  text-align: left;
  cursor: pointer;

  &.active {
    border-color: rgba(114,231,212,.35);
    background: rgba(114,231,212,.055);
  }

  small, strong, p { display: block; }
  small { color: var(--accent-2); font-size: 8px; text-transform: uppercase; }
  strong { margin-top: 5px; font-size: 11px; }
  p { margin: 3px 0 0; color: var(--muted); font-size: 9px; }
  > b { color: var(--accent); }
}

.is-application-empty {
  padding: 24px 14px;
  border: 1px dashed var(--line);
  border-radius: 11px;
  color: var(--muted);
  font-size: 9px;
  line-height: 1.5;
}

.is-application-editor {
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 15px;
  background: rgba(255,255,255,.98);
}

.is-application-editor__heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 24px;

  h2 {
    margin: 8px 0 0;
    font-size: clamp(24px, 3vw, 38px);
    letter-spacing: -.035em;
  }
}

.is-coverage-score {
  min-width: 88px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  align-content: center;
  border: 1px solid rgba(114,231,212,.25);
  border-radius: 50%;

  b { color: var(--accent); font-size: 28px; letter-spacing: -.04em; }
  span { color: var(--muted); font-size: 7px; }
}

.is-application-form {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 11px;

  label {
    display: grid;
    gap: 7px;

    > span { color: var(--muted); font-size: 9px; font-weight: 650; }
  }

  label.wide { grid-column: 1 / -1; }

  input, select, textarea {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: #f5f9fb;
    color: var(--ink);
    font: inherit;
  }

  input, select { min-height: 40px; padding: 0 10px; font-size: 10px; }
  textarea { padding: 12px; resize: vertical; font-size: 10px; line-height: 1.55; }
}

.is-application-actions {
  margin-top: 14px;
  padding-bottom: 22px;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 8px;
  align-items: center;
  border-bottom: 1px solid var(--line);

  .danger { color: var(--danger); }
  button:disabled { opacity: .45; cursor: not-allowed; }
}

.is-coverage-summary {
  padding: 24px 0;
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 22px;
  align-items: center;
  border-bottom: 1px solid var(--line);

  h3 { margin: 7px 0 5px; font-size: 17px; line-height: 1.35; }
  p { margin: 0; color: var(--muted); font-size: 9px; }
}

.is-coverage-ring {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  align-content: center;
  border: 1px solid rgba(114,231,212,.22);
  border-radius: 50%;
  background: rgba(114,231,212,.035);

  b { color: var(--accent); font-size: 31px; }
  span { color: var(--muted); font-size: 8px; }
}

.is-coverage-grid {
  padding: 20px 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  border-bottom: 1px solid var(--line);
}

.is-signal-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  span {
    padding: 5px 7px;
    border-radius: 6px;
    background: rgba(114,231,212,.07);
    color: var(--accent);
    font-size: 8px;
  }

  &.gaps span {
    background: rgba(243,200,106,.07);
    color: var(--warning);
  }

  small { color: var(--muted); font-size: 9px; }
}

.is-coverage-list {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;

  li { padding: 10px 0; border-top: 1px solid var(--line); }
  strong { font-size: 9px; }
  p { margin: 4px 0 0; color: var(--muted); font-size: 9px; line-height: 1.45; }
}


.is-stage-matrix {
  padding-top: 22px;
  border-top: 1px solid var(--line);

  h3 {
    margin: 7px 0 0;
    font-size: 16px;
    letter-spacing: -.02em;
  }

  .is-panel__heading > small {
    color: var(--muted);
    font-size: 8px;
  }
}

.is-stage-matrix__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.is-stage-matrix__grid article {
  min-width: 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: #f5f9fb;

  &.recommended {
    border-color: rgba(114,231,212,.35);
    background: rgba(114,231,212,.045);
  }

  > p {
    min-height: 58px;
    margin: 10px 0;
    color: var(--muted);
    font-size: 8px;
    line-height: 1.5;
  }

  > ol {
    margin: 12px 0;
    padding-left: 14px;
    color: var(--muted);
    font-size: 8px;
    line-height: 1.45;
  }

  > ol li + li { margin-top: 5px; }

  > button {
    margin-top: auto;
    padding: 9px 0 0;
    border: 0;
    border-top: 1px solid var(--line);
    background: transparent;
    color: var(--accent);
    font: inherit;
    font-size: 8px;
    text-align: left;
    cursor: pointer;
  }
}

.is-stage-matrix__top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 8px;

  span, strong { display: block; }
  span { margin-bottom: 4px; color: var(--accent); font-size: 6px; font-weight: 780; letter-spacing: .08em; }
  strong { font-size: 9px; line-height: 1.35; }
  > b { color: var(--accent-2); font-size: 18px; letter-spacing: -.03em; }
}

.is-stage-matrix__focus {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  span {
    padding: 3px 5px;
    border-radius: 5px;
    background: rgba(8,122,112,.06);
    color: var(--faint);
    font-size: 7px;
  }
}

.is-application-questions {
  padding-top: 20px;

  ol { margin: 10px 0 0; padding: 0; list-style: none; }
  li {
    padding: 11px 0;
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 10px;
    border-top: 1px solid var(--line);
  }
  li span { color: var(--muted); font-size: 8px; }
  li strong { font-size: 10px; line-height: 1.45; }
}


/* Responsive rules follow all component base styles, including Application Lab. */
@media (max-width: 1180px) {
  .is-shell { grid-template-columns: 190px minmax(0, 1fr); }
  .is-source-grid { grid-template-columns: repeat(3, 1fr); }
  .is-stage-matrix__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .is-claim-layout { grid-template-columns: 300px minmax(0, 1fr); }
}

@media (max-width: 900px) {
  .is-shell { display: block; }
  .is-sidebar {
    position: sticky;
    z-index: 30;
    height: auto;
    padding: 9px 12px;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .is-brand { padding: 0; }
  .is-brand small, .is-sidebar__context, .is-sidebar__footer { display: none; }
  .is-nav { display: flex; min-width: 0; justify-content: flex-start; overflow: auto; }
  .is-nav button { min-width: max-content; min-height: 44px; display: flex; }
  .is-nav button span:not(.is-nav__icon) { display: none; }
  .is-nav__icon { width: 28px; height: 28px; }
  .is-topbar { top: 58px; }
  .is-hero { min-height: auto; grid-template-columns: 1fr; gap: 30px; }
  .is-stat-grid { grid-template-columns: repeat(2, 1fr); }
  .is-stat-grid article:nth-child(2) { border-right: 0; }
  .is-overview-grid, .is-report-grid, .is-mock-start { grid-template-columns: 1fr; }
  .is-source-grid { grid-template-columns: repeat(2, 1fr); }
  .is-claim-layout, .is-application-layout { grid-template-columns: 1fr; }
  .is-stage-matrix__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .is-claim-list { max-height: 340px; grid-template-columns: repeat(2, 1fr); }
  .is-answer-grid { grid-template-columns: 1fr; }
}

@media (max-width: 620px) {
  .is-sidebar { grid-template-columns: auto 1fr; }
  .is-brand span:last-child { display: none; }
  .is-topbar { padding-inline: 14px; }
  .is-topbar > div:first-child small, .is-topbar__actions label { display: none; }
  .is-content { padding: 24px 14px 70px; }
  .is-hero { padding-top: 28px; }
  .is-hero h1 { font-size: 44px; }
  .is-stat-grid { grid-template-columns: 1fr 1fr; }
  .is-stat-grid article { padding: 16px 10px; }
  .is-context-grid, .is-mock-config, .is-application-form, .is-coverage-grid { grid-template-columns: 1fr; }
  .is-application-form label.wide { grid-column: auto; }
  .is-stage-matrix__grid { grid-template-columns: 1fr; }
  .is-application-actions { grid-template-columns: 1fr; }
  .is-coverage-summary { grid-template-columns: 72px 1fr; }
  .is-mock-config > div { grid-column: auto; }
  .is-source-grid { grid-template-columns: 1fr; }
  .is-page-heading { min-height: 200px; align-items: start; }
  .is-page-heading h1 { font-size: 40px; }
  .is-heading-number { display: none; }
  .is-filterbar { grid-template-columns: 1fr; }
  .is-question__body { padding-left: 16px; grid-template-columns: 1fr; }
  .is-question__example, .is-question__sources { grid-column: auto; }
  .is-claim-list { grid-template-columns: 1fr; }
  .is-claim-detail { padding: 18px; }
  .is-claim-detail__header { grid-template-columns: 1fr; }
  .is-risk-ring { width: 80px; }
  .is-live-session { padding: 20px 15px; }
  .is-live-session__meta { align-items: start; }
  .is-live-session > h2 { font-size: 30px; }
  .is-coach-grid { grid-template-columns: 1fr; }
  .is-story-grid { grid-template-columns: 1fr; }
  .is-story-stats { grid-template-columns: 1fr 1fr; }
  .is-story-stats article:nth-child(2) { border-right: 0; }
  .is-practice-plan__focus { grid-template-columns: 1fr; }
  .is-evaluation { grid-template-columns: 1fr; }
  .is-evaluation__score { padding-bottom: 14px; border-right: 0; border-bottom: 1px solid var(--line); }
  .is-session-actions { flex-direction: column; }
  .is-session-actions button { width: 100%; }
  .is-branch-trace__list article { grid-template-columns: 26px 1fr; }
  .is-branch-trace__trigger { grid-column: 2; display: flex; gap: 8px; align-items: baseline; text-align: left; }
  .is-branch-trace__trigger span, .is-branch-trace__trigger b { display: inline; }
  .is-history-table article { grid-template-columns: 1fr auto; }
  .is-history-table article > span { display: none; }
  .is-report-hero { grid-template-columns: 1fr; }
  .is-report-score { padding-right: 0; padding-bottom: 14px; border-right: 0; border-bottom: 1px solid var(--line); }
}

/* 2026 UI normalization: readable small copy and fewer competing surfaces. */
.is-shell { --muted: #506779; --faint: #687f8e; }
.is-content { padding-top: 26px; }
.is-hero { min-height: 300px; padding: 28px 0; gap: clamp(24px, 5vw, 70px); }
.is-hero h1 { max-width: 18ch; margin: 12px 0 17px; font-size: clamp(42px, 5vw, 66px); line-height: 1.04; }
.is-hero > div > p { font-size: 13px; max-width: 48ch; }
.is-page-heading { min-height: 168px; padding: 14px 0 24px; gap: 20px; }
.is-page-heading h1 { max-width: 25ch; font-size: clamp(35px, 4vw, 49px); margin-bottom: 10px; line-height: 1.05; }
.is-page-heading p { font-size: 12px; }
.is-heading-number { font-size: clamp(50px, 6vw, 100px); }
.is-panel { padding: 20px; }
.is-panel__heading { margin-bottom: 15px; }
.is-panel__heading h2 { font-size: 17px; }
.is-context-grid label > span, .is-application-form label > span,
.is-shell .is-application-form input, .is-shell .is-application-form textarea,
.is-shell .is-application-form select { font-size: 12px; }
.is-shell select, .is-shell input[type="search"] { font-size: 12px; }
.is-action-list p, .is-signal p { font-size: 10px; }
.is-source-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.is-source-grid a { min-height: 112px; }
.is-source-grid a p { font-size: 10px; }
.is-application-layout { margin-top: 14px; }
.is-market {
  margin: 22px 0 6px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgba(255,255,255,.98);
  overflow: hidden;
}
.is-market__header {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.is-market__header h2 { margin: 5px 0 3px; font-size: 20px; letter-spacing: -.03em; }
.is-market__header small { color: var(--muted); font-size: 10px; }
.is-market__toggle {
  padding: 8px 12px;
  flex: none;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.is-market__body { padding: 0 20px 18px; }
.is-market__tools {
  padding: 12px 0;
  display: flex;
  gap: 9px;
  align-items: center;
  flex-wrap: wrap;
  border-top: 1px solid var(--line);
}
.is-market__tabs { display: flex; flex-wrap: wrap; gap: 5px; margin-right: auto; }
.is-market__tabs button {
  min-height: 35px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.is-market__tabs button.active {
  border-color: rgba(114,231,212,.25);
  background: rgba(114,231,212,.10);
  color: var(--accent);
}
.is-market__search input, .is-market__tools select {
  height: 35px;
  min-width: 125px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: #f5f9fb;
  color: var(--ink);
  font: inherit;
  font-size: 11px;
}
.is-market__search input { min-width: min(190px, 100%); }
.is-market__grid {
  padding: 10px 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
}
.is-market__card {
  min-width: 0;
  min-height: 142px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: rgba(255,255,255,.96);
}
.is-market__card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.is-market__card-top strong { color: var(--accent-2); font-size: 10px; }
.is-market__card-top small { color: var(--faint); font-size: 9px; text-align: right; }
.is-market__card h3 { margin: 11px 0 9px; font-size: 14px; line-height: 1.35; letter-spacing: -.01em; }
.is-market__card > small { margin-top: auto; color: var(--muted); font-size: 10px; }
.is-market__salary { color: var(--accent); font-size: 13px; }
.is-market__links {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: auto;
  padding-top: 12px;
  align-items: center;
  justify-content: space-between;
}
.is-market__links a, .is-market__links button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  text-decoration: none;
}
.is-market__links a:hover { text-decoration: underline; }
.is-market__links span { color: var(--faint); font-size: 9px; }
.is-market__empty { color: var(--muted); font-size: 12px; }
.is-market__disclaimer { margin: 10px 0 0; color: var(--muted); font-size: 10px; line-height: 1.55; }
@media (max-width: 1200px) { .is-market__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) {
  .is-page-heading h1 { font-size: 36px; }
  .is-hero { padding-top: 20px; }
  .is-hero h1 { font-size: 42px; }
  .is-source-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .is-market__header { align-items: start; padding: 15px; }
  .is-market__header small { display: block; line-height: 1.4; }
  .is-market__body { padding: 0 14px 14px; }
  .is-market__tools { align-items: stretch; }
  .is-market__tabs { width: 100%; }
  .is-market__tools select, .is-market__search { flex: 1 1 44%; min-width: 0; }
  .is-market__search input { width: 100%; }
  .is-market__grid { grid-template-columns: 1fr; }
}


.is-deep-evidence {
  margin: 14px 0 20px;
  border-bottom: 1px solid var(--line);
}
.is-deep-evidence > summary {
  padding: 12px 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--accent);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.is-deep-evidence[open] > summary span { transform: rotate(45deg); }
.is-stage-questions { margin: 11px 0; }
.is-stage-questions > summary {
  color: var(--accent-2);
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}
.is-stage-questions ol { margin-top: 8px; }
.is-market__card:focus-within, .is-market__tabs button:focus-visible,
.is-market__toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Interview Studio · Light 2026 · permanent default */
.is-shell {
  color-scheme: light;
  --canvas: #f6f9fc;
  --shadow: 0 10px 34px rgba(30, 73, 93, .055);
  background: radial-gradient(ellipse at 85% 0%, #e6f6f3 0%, transparent 32%), #f6f9fc;
}
.is-sidebar {
  background: rgba(255,255,255,.97);
  box-shadow: 1px 0 0 rgba(25,75,95,.07);
}
.is-topbar {
  background: rgba(255,255,255,.94);
  box-shadow: 0 2px 15px rgba(25,65,85,.04);
}
.is-brand__mark { color: #fff; background: var(--accent); box-shadow: 0 6px 18px rgba(8,122,112,.16); }
.is-command, .is-button--primary {
  background: var(--accent);
  color: #fff;
}
.is-command:hover, .is-button--primary:hover { background: #06685f; color: #fff; }
.is-panel,.is-readiness,.is-application-editor,.is-story-card,
.is-claim-detail,.is-mock-config,.is-mock-preview,.is-live-session,
.is-report-hero,.is-question,.is-application-list > button {
  background: #fff;
  box-shadow: var(--shadow);
}
.is-panel:hover,.is-application-list > button:hover {
  border-color: rgba(8,122,112,.20);
}
.is-context-grid select,.is-application-form input,.is-application-form select,
.is-application-form textarea,.is-topbar select,.is-mock-config select,
.is-claim-note textarea,.is-answer-grid textarea,
.is-filterbar input,.is-filterbar select,.is-market__tools select,.is-market__tools input,
.is-application-form input[type="url"] {
  color: var(--ink);
  background: #f8fbfd;
  border-color: rgba(23,78,99,.18);
}
.is-shell :is(input, textarea)::placeholder { color: #708595; }
.is-shell :is(button, a, input, select, textarea, summary):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.is-nav button.active { background: #e8f5f2; box-shadow: inset 3px 0 0 var(--accent); }
.is-nav button:hover { background: #f1f8f7; }
.is-source-grid a:hover { background: #eff8f6; }
.is-signal,.is-coverage-summary,.is-mock-preview,.is-evaluation {
  background: #f3faf8;
}
.is-readiness__bar, .is-evaluation__bars > div > i { background: #dbe8eb; }
.is-market { background: #fff; box-shadow: var(--shadow); }
.is-market__card { background: #fcfefe; box-shadow: 0 2px 12px rgba(25,65,85,.025); }
.is-market__tabs button.active { background: #e9f6f3; }
.is-scenario-picker {
  margin: 18px 0 12px;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 17px;
  background: #fff;
  box-shadow: var(--shadow);
}
.is-scenario-picker__heading { display:flex; align-items:start; justify-content:space-between; gap:14px; margin-bottom:15px; }
.is-scenario-picker__heading h2 { margin:6px 0 4px; font-size:22px; line-height:1.2; letter-spacing:-.025em; }
.is-scenario-picker__heading p { margin:0; color:var(--muted); font-size:12px; }
.is-scenario-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:9px; }
.is-scenario-card {
  min-width:0;
  min-height:98px;
  padding:12px;
  display:grid;
  grid-template-columns:24px 1fr 17px;
  gap:8px;
  align-items:start;
  border:1px solid rgba(24,74,94,.15);
  border-radius:11px;
  background:#fff;
  color:var(--ink);
  font:inherit;
  text-align:left;
  cursor:pointer;
  transition:background .15s,border-color .15s,box-shadow .15s;
}
.is-scenario-card:hover { background:#f2faf8; border-color:rgba(8,122,112,.35); }
.is-scenario-card--active { background:#e9f7f3; border-color:var(--accent); box-shadow:inset 0 0 0 1px var(--accent); }
.is-scenario-card__number { color:var(--accent); font-weight:750; font-size:11px; }
.is-scenario-card__body { min-width:0; }
.is-scenario-card__body strong { display:block; color:var(--ink); font-size:12px; line-height:1.35; }
.is-scenario-card__body small { display:block; margin-top:8px; color:var(--muted); font-size:10px; line-height:1.45; }
.is-scenario-card__check { text-align:right; color:var(--accent); font-size:13px; }
.is-scenario-preview {
  margin-top:13px; padding:14px 16px;
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
  border:1px solid #cfebe3; border-radius:11px; background:#f2faf7;
}
.is-scenario-preview > span { color:var(--accent); font-size:11px; font-weight:700; }
.is-scenario-preview > p { flex:1 1 250px; margin:0; color:var(--muted); font-size:12px; }
.is-scenario-preview > button { white-space:nowrap; }
.is-mock-start { padding-top:12px; }
.is-mock-preview { background: #f8fbfd; }
.is-hero h1 { letter-spacing:-.052em; }
.is-page-heading h1 { letter-spacing:-.046em; }
.is-shell :is(.is-panel,.is-mock-config,.is-mock-preview,.is-market,.is-scenario-picker) { border-color:rgba(24,74,94,.13); }
@media(max-width:1199px) { .is-scenario-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media(max-width:900px) { .is-scenario-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:620px) {
  .is-scenario-picker { padding:14px; }
  .is-scenario-grid { grid-template-columns:1fr 1fr; gap:7px; }
  .is-scenario-card { grid-template-columns:1fr 15px; min-height:90px; padding:11px; }
  .is-scenario-card__number { display:none; }
  .is-scenario-card__body strong { font-size:12px; }
  .is-scenario-card__body small { font-size:10px; }
  .is-scenario-preview { flex-direction:column; align-items:stretch; }
  .is-scenario-preview > p { flex-basis:auto; }
}

.is-scenario-picker__actions { display:flex; align-items:center; flex-wrap:wrap; gap:12px; }
.is-scenario-picker__actions button { font-size:11px; color:var(--accent); }

/* One-minute decision: objective > focus > three-question practice > feedback. */
.is-growth {
  margin-bottom: 26px;
  padding: clamp(18px,2vw,28px);
  background: #fff;
  border: 1px solid rgba(24,74,94,.13);
  border-radius: 18px;
  box-shadow: 0 10px 34px rgba(30,73,93,.045);
}
.is-growth__heading {
  display:flex;
  justify-content:space-between;
  align-items:start;
  flex-wrap:wrap;
  gap:12px;
}
.is-growth__heading h2 { margin:7px 0 5px; font-size:clamp(21px,2.4vw,27px); letter-spacing:-.035em; }
.is-growth__heading p { margin:0; color:var(--muted); font-size:12px; }
.is-growth__baseline {
  padding:7px 10px;
  border:1px solid var(--line);
  border-radius:99px;
  color:var(--muted);
  background:#f7fafb;
  font-size:11px;
}
.is-growth__goals { display:flex; gap:7px; flex-wrap:wrap; margin:19px 0 17px; }
.is-growth__goals button {
  padding:10px 12px;
  min-height:40px;
  font:inherit;
  font-size:11px;
  background:#f9fbfc;
  border:1px solid rgba(24,74,94,.16);
  color:var(--muted);
  border-radius:9px;
  cursor:pointer;
}
.is-growth__goals button:hover { border-color:var(--accent); color:var(--ink); }
.is-growth__goals button.active { background:#e7f6f2; border-color:var(--accent); color:#08685f; font-weight:750; }
.is-growth__focus { display:grid; grid-template-columns:minmax(0,1fr) minmax(290px,.85fr); gap:12px; }
.is-growth__primary {
  padding:22px;
  background:linear-gradient(125deg,#e8f8f3,#f6fbfc);
  border:1px solid #d6ebe6;
  border-radius:13px;
}
.is-growth__primary h3 { margin:9px 0 7px; font-size:clamp(22px,2.5vw,30px); letter-spacing:-.035em; }
.is-growth__primary p { max-width:44ch; margin:0 0 18px; color:var(--muted); font-size:12px; line-height:1.55; }
.is-growth__primary small { display:block; margin-top:9px; font-size:10px; color:var(--muted); }
.is-growth__steps { padding:19px 22px; border:1px solid var(--line); border-radius:13px; background:#fff; }
.is-growth__steps ol { margin:13px 0 0; padding:0; list-style:none; display:grid; gap:13px; }
.is-growth__steps li { display:grid; grid-template-columns:24px 1fr; gap:9px; align-items:start; color:var(--ink); font-size:12px; line-height:1.5; }
.is-growth__steps li b { display:grid; place-items:center; width:22px; height:22px; border-radius:7px; background:#e7f6f2; color:var(--accent); font-size:11px; }
.is-growth__trend,.is-growth__hint { margin:13px 0 0; color:var(--muted); font-size:10px; line-height:1.5; }
.is-growth__disclaimer { margin:12px 0 0; color:var(--muted); font-size:10px; }
.is-growth-next { padding:17px 20px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; border:1px solid #d6ebe6; border-radius:13px; background:#eff9f6; }
.is-growth-next > div { display:grid; gap:4px; }
.is-growth-next strong { color:var(--ink); font-size:16px; }
.is-growth-next small { color:var(--muted); font-size:11px; }
@media(max-width:950px){.is-growth__focus{grid-template-columns:1fr}.is-growth__steps{padding:16px}}
@media(max-width:620px){.is-growth{padding:15px}.is-growth__goals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.is-growth__goals button{min-width:0;padding:10px 7px;font-size:10px}.is-growth__primary{padding:17px}.is-growth-next{align-items:stretch}.is-growth-next button{width:100%}}


.is-retry-coach {
  margin: 16px 0;
  padding: 16px 18px;
  background: #f1f9f6;
  border: 1px solid #cae8df;
  border-radius: 12px;
}
.is-retry-coach__title { display:flex; align-items:center; flex-wrap:wrap; gap:10px; }
.is-retry-coach__title strong { font-size:15px; color:var(--ink); }
.is-retry-coach > p { margin:8px 0 5px; color:var(--ink); font-size:12px; line-height:1.55; }
.is-retry-coach > small { display:block; color:var(--muted); font-size:11px; }
.is-retry-coach > button { margin-top:12px; }
.is-retry-coach__comparison {
  display:flex; align-items:center; flex-wrap:wrap; gap:11px;
  margin-top:13px; padding:10px 12px;
  background:#fff; border:1px solid var(--line); border-radius:9px;
}
.is-retry-coach__comparison strong { font-size:17px; color:var(--accent); }
.is-retry-coach__comparison span { font-size:11px; color:var(--muted); line-height:1.45; }

.is-revision-prompt { margin: 10px 0; color: var(--accent); font-size: 12px; line-height: 1.45; }
</style>
