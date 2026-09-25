import { canReorderTemplateSection, getTemplateLayoutContract, isTemplateSectionVisible, sameTemplateSectionGroup } from '../../data/template-layout-contracts'

export const referenceTemplateMixin = {
  props: {
    profile: { type: Object, required: true },
    accent: { type: String, required: true },
    appearance: { type: Object, default: () => ({}) },
    interactive: { type: Boolean, default: false },
    templateId: { type: String, default: '' },
  },
  emits: ['edit-section', 'reorder-section'],
  data() {
    return {
      dragSectionId: null,
      dragJustEnded: false,
    }
  },
  computed: {
    avatarImageStyle() {
      const x = Number.isFinite(Number(this.appearance?.avatarX)) ? Math.min(100, Math.max(0, Number(this.appearance.avatarX))) : 50
      const y = Number.isFinite(Number(this.appearance?.avatarY)) ? Math.min(100, Math.max(0, Number(this.appearance.avatarY))) : 50
      const zoom = Number.isFinite(Number(this.appearance?.avatarZoom)) ? Math.min(2.5, Math.max(1, Number(this.appearance.avatarZoom))) : 1
      const rotate = Number.isFinite(Number(this.appearance?.avatarRotate)) ? Math.min(180, Math.max(-180, Number(this.appearance.avatarRotate))) : 0
      return { objectPosition: `${x}% ${y}%`, transform: `scale(${zoom}) rotate(${rotate}deg)` }
    },
    metrics() {
      return [
        { value: `${this.profile.experience?.length || 0}+`, label: 'Roles' },
        { value: `${this.profile.projects?.length || 0}+`, label: 'Projects' },
        { value: `${this.profile.skills?.length || 0}+`, label: 'Skills' },
        { value: `${this.profile.languages?.length || 0}+`, label: 'Languages' },
      ]
    },
    initials() {
      return String(this.profile.name || 'CV').split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
    },
    printPolicyClass() {
      const policy=getTemplateLayoutContract(this.templateId).print?.multiPage||'preserve-flow'
      return `print-${policy}`
    },
    referenceAppearanceClasses() {
      const font = ['sans', 'serif', 'mono'].includes(this.appearance?.font) ? this.appearance.font : 'sans'
      const density = ['compact', 'balanced', 'spacious'].includes(this.appearance?.density) ? this.appearance.density : 'balanced'
      const radius = ['sharp', 'soft', 'round'].includes(this.appearance?.radius) ? this.appearance.radius : 'soft'
      const projectLayout = ['cards', 'list'].includes(this.appearance?.projectLayout) ? this.appearance.projectLayout : 'cards'
      const spacing = ['compact', 'balanced', 'airy'].includes(this.appearance?.sectionSpacing) ? this.appearance.sectionSpacing : 'balanced'
      const textScale = Number.isFinite(Number(this.appearance?.textScale)) ? Math.round(Math.min(1.15, Math.max(.9, Number(this.appearance.textScale))) * 100) : 100
      const headingScale = Number.isFinite(Number(this.appearance?.headingScale)) ? Math.round(Math.min(1.2, Math.max(.9, Number(this.appearance.headingScale))) * 100) : 100
      const size = ['small', 'medium', 'large'].includes(this.appearance?.avatarSize) ? this.appearance.avatarSize : 'medium'
      const shape = ['circle', 'rounded', 'square'].includes(this.appearance?.avatarShape) ? this.appearance.avatarShape : 'circle'
      return [
        `cv-font-${font}`,
        `cv-density-${density}`,
        `cv-radius-${radius}`,
        `cv-projects-${projectLayout}`,
        `cv-spacing-${spacing}`,
        `cv-text-${textScale}`,
        `cv-heading-${headingScale}`,
        `cv-avatar-size-${size}`,
        `cv-avatar-${shape}`,
        this.printPolicyClass,
      ]
    },
  },
  methods: {
    visible(sectionId) { return isTemplateSectionVisible(this.profile, this.templateId, sectionId) },
    canReorder(sectionId) { return canReorderTemplateSection(this.templateId, sectionId) },
    imageStyle(url) {
      if (!url) return {}
      return { backgroundImage: `url("${String(url).replace(/"/g, '%22')}")` }
    },
    editAttrs(tab, sectionId = null, field = '') {
      const attrs = {}
      if (sectionId) {
        attrs['data-section-id'] = sectionId
        attrs['data-section-supported'] = String(getTemplateLayoutContract(this.templateId).sections[sectionId]?.supported !== false)
        if (!this.visible(sectionId)) attrs.style = { display: 'none' }
      }
      if (!this.interactive) return attrs
      attrs['data-edit-section'] = tab
      attrs.tabindex = 0
      attrs.role = 'button'
      attrs['aria-label'] = field ? `Edit ${field}` : `Edit ${tab} section`
      if (sectionId && this.canReorder(sectionId)) attrs.draggable = 'true'
      if (field) attrs['data-edit-field'] = field
      return attrs
    },
    handleEditRequest(event) {
      if (!this.interactive || this.dragJustEnded) return
      const target = event.target?.closest?.('[data-edit-section]')
      if (!target || !this.$el.contains(target)) return
      const tab = target.getAttribute('data-edit-section')
      const field = target.getAttribute('data-edit-field') || ''
      if (tab) this.$emit('edit-section', field ? { tab, field } : tab)
    },
    handleKeydown(event) {
      if (!this.interactive || !['Enter', ' '].includes(event.key)) return
      const target = event.target?.closest?.('[data-edit-section]')
      if (!target) return
      event.preventDefault()
      const tab = target.getAttribute('data-edit-section')
      const field = target.getAttribute('data-edit-field') || ''
      if (tab) this.$emit('edit-section', field ? { tab, field } : tab)
    },
    clearDragClasses() {
      this.$el?.querySelectorAll?.('.is-section-dragging, .is-section-drop-target').forEach((node) => node.classList.remove('is-section-dragging', 'is-section-drop-target'))
    },
    handleDragStart(event) {
      if (!this.interactive) return
      const section = event.target?.closest?.('[data-section-id]')
      if (!section || !this.$el.contains(section)) return
      this.dragSectionId = section.getAttribute('data-section-id')
      if (!this.dragSectionId || !this.canReorder(this.dragSectionId)) { this.dragSectionId = null; return }
      section.classList.add('is-section-dragging')
      event.dataTransfer?.setData('text/plain', this.dragSectionId)
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
    },
    handleDragOver(event) {
      if (!this.dragSectionId) return
      const section = event.target?.closest?.('[data-section-id]')
      if (!section || !this.$el.contains(section)) return
      const targetId = section.getAttribute('data-section-id')
      if (!targetId || targetId === this.dragSectionId || !this.canReorder(targetId) || !sameTemplateSectionGroup(this.templateId, this.dragSectionId, targetId)) return
      event.preventDefault()
      this.$el.querySelectorAll('.is-section-drop-target').forEach((node) => node.classList.remove('is-section-drop-target'))
      section.classList.add('is-section-drop-target')
    },
    handleDrop(event) {
      if (!this.dragSectionId) return
      const section = event.target?.closest?.('[data-section-id]')
      const targetId = section?.getAttribute?.('data-section-id')
      if (targetId && targetId !== this.dragSectionId && this.canReorder(targetId) && sameTemplateSectionGroup(this.templateId, this.dragSectionId, targetId)) {
        event.preventDefault()
        this.$emit('reorder-section', { source: this.dragSectionId, target: targetId })
      }
      this.handleDragEnd()
    },
    handleDragEnd() {
      this.clearDragClasses()
      this.dragSectionId = null
      this.dragJustEnded = true
      window.setTimeout(() => { this.dragJustEnded = false }, 0)
    },
  },
}
