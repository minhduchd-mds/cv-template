export const referenceTemplateMixin = {
  props: {
    profile: { type: Object, required: true },
    accent: { type: String, required: true },
    appearance: { type: Object, default: () => ({}) },
    interactive: { type: Boolean, default: false },
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
    referenceAppearanceClasses() {
      const size = ['small', 'medium', 'large'].includes(this.appearance?.avatarSize) ? this.appearance.avatarSize : 'medium'
      const shape = ['circle', 'rounded', 'square'].includes(this.appearance?.avatarShape) ? this.appearance.avatarShape : 'circle'
      return [`cv-avatar-size-${size}`, `cv-avatar-${shape}`]
    },
  },
  methods: {
    imageStyle(url) {
      if (!url) return {}
      return { backgroundImage: `url("${String(url).replace(/"/g, '%22')}")` }
    },
    editAttrs(tab, sectionId = null) {
      if (!this.interactive) return {}
      const attrs = {
        'data-edit-section': tab,
        tabindex: 0,
        role: 'button',
        'aria-label': `Edit ${tab} section`,
      }
      if (sectionId) {
        attrs['data-section-id'] = sectionId
        attrs.draggable = 'true'
      }
      return attrs
    },
    handleEditRequest(event) {
      if (!this.interactive || this.dragJustEnded) return
      const target = event.target?.closest?.('[data-edit-section]')
      if (!target || !this.$el.contains(target)) return
      const tab = target.getAttribute('data-edit-section')
      if (tab) this.$emit('edit-section', tab)
    },
    handleKeydown(event) {
      if (!this.interactive || !['Enter', ' '].includes(event.key)) return
      const target = event.target?.closest?.('[data-edit-section]')
      if (!target) return
      event.preventDefault()
      const tab = target.getAttribute('data-edit-section')
      if (tab) this.$emit('edit-section', tab)
    },
    clearDragClasses() {
      this.$el?.querySelectorAll?.('.is-section-dragging, .is-section-drop-target').forEach((node) => node.classList.remove('is-section-dragging', 'is-section-drop-target'))
    },
    handleDragStart(event) {
      if (!this.interactive) return
      const section = event.target?.closest?.('[data-section-id]')
      if (!section || !this.$el.contains(section)) return
      this.dragSectionId = section.getAttribute('data-section-id')
      if (!this.dragSectionId) return
      section.classList.add('is-section-dragging')
      event.dataTransfer?.setData('text/plain', this.dragSectionId)
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
    },
    handleDragOver(event) {
      if (!this.dragSectionId) return
      const section = event.target?.closest?.('[data-section-id]')
      if (!section || !this.$el.contains(section)) return
      const targetId = section.getAttribute('data-section-id')
      if (!targetId || targetId === this.dragSectionId) return
      event.preventDefault()
      this.$el.querySelectorAll('.is-section-drop-target').forEach((node) => node.classList.remove('is-section-drop-target'))
      section.classList.add('is-section-drop-target')
    },
    handleDrop(event) {
      if (!this.dragSectionId) return
      const section = event.target?.closest?.('[data-section-id]')
      const targetId = section?.getAttribute?.('data-section-id')
      if (targetId && targetId !== this.dragSectionId) {
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
