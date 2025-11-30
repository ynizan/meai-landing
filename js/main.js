/**
 * InTouch Landing Page JavaScript
 * Handles A/B variants, form interactions, analytics, and localStorage persistence
 */

(function() {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const STORAGE_KEY = 'meai_form_progress';

  const TIERS = {
    starter: { min: 50, max: 200, name: 'Starter', price: '$100/mo', foundingPrice: '$70/mo', baseContacts: 200 },
    professional: { min: 201, max: 500, name: 'Professional', price: '$250/mo', foundingPrice: '$175/mo', baseContacts: 500 },
    executive: { min: 501, max: 1000, name: 'Executive', price: '$350/mo', foundingPrice: '$245/mo', baseContacts: 1000 },
    leader: { min: 1001, max: 2000, name: 'Leader', price: '$500/mo', foundingPrice: '$350/mo', baseContacts: 2000 }
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let currentTier = 'starter';
  let viralEnabled = false;
  let variant = 'a';

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const elements = {
    // Variant elements
    variantContents: document.querySelectorAll('[data-variant]'),

    // Hero
    heroCta: document.getElementById('hero-cta'),

    // Phases
    phase1: document.getElementById('phase-1'),
    phase2: document.getElementById('phase-2'),

    // Slider
    contactSlider: document.getElementById('contact-count'),
    contactNumber: document.querySelector('.contact-number'),
    tierPreview: document.getElementById('tier-preview'),
    tierName: document.querySelector('.tier-name'),
    tierPrice: document.querySelector('.tier-price'),

    // Checkboxes
    checkboxes: document.querySelectorAll('input[name="relationship_types"]'),

    // Phase 1 CTA
    phase1Cta: document.getElementById('phase-1-cta'),

    // Pricing
    pricingCards: document.querySelectorAll('.pricing-card'),
    viralToggle: document.getElementById('viral-toggle'),

    // Application form
    applicationForm: document.getElementById('application-form'),
    applicationSuccess: document.getElementById('application-success'),

    // Custom dropdown
    contactSourceDropdown: document.getElementById('contact-source-dropdown'),
    contactSourceHidden: document.getElementById('contact-source'),

    // Plan header
    selectedTierName: document.querySelector('.selected-tier-name'),

    // Hidden fields
    formVariant: document.getElementById('form-variant'),
    formTier: document.getElementById('form-tier'),
    formContactCount: document.getElementById('form-contact-count'),
    formViral: document.getElementById('form-viral'),
    formTimestamp: document.getElementById('form-timestamp'),
    formRelationshipTypes: document.getElementById('form-relationship-types'),
    formPrimaryGoal: document.getElementById('form-primary-goal')
  };

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  /**
   * Track event with Plausible analytics
   */
  function trackEvent(eventName, props = {}) {
    if (typeof plausible !== 'undefined') {
      plausible(eventName, { props });
    } else {
      console.log('[Analytics]', eventName, props);
    }
  }

  /**
   * Smooth scroll to element
   */
  function scrollToElement(element, offset = 0) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /**
   * Get tier based on contact count
   */
  function getTierForCount(count) {
    for (const [key, tier] of Object.entries(TIERS)) {
      if (count >= tier.min && count <= tier.max) {
        return key;
      }
    }
    return 'leader';
  }

  /**
   * Format number with commas
   */
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Calculate contact limit with viral bonus
   */
  function getContactLimit(tierKey, viralEnabled) {
    const tier = TIERS[tierKey];
    if (!tier || tierKey === 'leader') return tier ? '1K+' : '200';
    const base = tier.baseContacts;
    const limit = viralEnabled ? Math.floor(base * 1.5) : base;
    // Use "1K" notation for 1000+
    if (limit >= 1000) {
      return limit === 1000 ? '1K' : (limit / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return formatNumber(limit);
  }

  // ==========================================================================
  // A/B Variant Handling
  // ==========================================================================

  function initVariant() {
    const urlParams = new URLSearchParams(window.location.search);
    variant = urlParams.get('v') || 'a';

    // Show appropriate hero content
    elements.variantContents.forEach(el => {
      if (el.dataset.variant === variant) {
        el.classList.add('active');
        el.style.display = 'block';
      } else {
        el.classList.remove('active');
        el.style.display = 'none';
      }
    });

    // Set variant in hidden form field
    if (elements.formVariant) elements.formVariant.value = variant;
  }

  // ==========================================================================
  // Slider Handling
  // ==========================================================================

  function updateSliderDisplay(value) {
    const count = parseInt(value, 10);
    const tierKey = getTierForCount(count);
    const tier = TIERS[tierKey];

    // Update display
    elements.contactNumber.textContent = formatNumber(count);
    elements.tierName.textContent = tier.name + ' tier';
    elements.tierPrice.textContent = tier.foundingPrice;

    currentTier = tierKey;
    updatePricingCards();
  }

  function initSlider() {
    if (!elements.contactSlider) return;

    elements.contactSlider.addEventListener('input', (e) => {
      updateSliderDisplay(e.target.value);
      saveFormProgress();
    });

    // Initialize with default or restored value
    updateSliderDisplay(elements.contactSlider.value);
  }

  // ==========================================================================
  // Checkbox Handling
  // ==========================================================================

  function initCheckboxes() {
    elements.checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const conditionalInput = document.querySelector(`.conditional-input[data-for="${this.value}"]`);
        if (conditionalInput) {
          conditionalInput.classList.toggle('visible', this.checked);
        }
        saveFormProgress();

        // Track first interaction
        if (this.checked && !window.phase1Started) {
          window.phase1Started = true;
          trackEvent('Phase1_Started');
        }
      });
    });

    // Track slider interaction as Phase1_Started
    if (elements.contactSlider) {
      elements.contactSlider.addEventListener('input', function() {
        if (!window.phase1Started) {
          window.phase1Started = true;
          trackEvent('Phase1_Started');
        }
      }, { once: true });
    }
  }

  // ==========================================================================
  // Pricing Cards
  // ==========================================================================

  function updatePricingCards() {
    elements.pricingCards.forEach(card => {
      const cardTier = card.dataset.tier;
      const isHighlighted = cardTier === currentTier;
      card.classList.toggle('highlighted', isHighlighted);

      // Update contact limits for viral bonus
      const limitEl = card.querySelector('.contact-limit');
      if (limitEl) {
        limitEl.textContent = getContactLimit(cardTier, viralEnabled);
      }
    });

    // Update plan header tier name
    if (elements.selectedTierName) {
      elements.selectedTierName.textContent = TIERS[currentTier].name;
    }
  }

  function initViralToggle() {
    if (!elements.viralToggle) return;

    elements.viralToggle.addEventListener('change', function() {
      viralEnabled = this.checked;
      updatePricingCards();
      saveFormProgress();
      trackEvent(viralEnabled ? 'Viral_Toggle_On' : 'Viral_Toggle_Off');
    });
  }

  function initPricingCardSelection() {
    elements.pricingCards.forEach(card => {
      card.addEventListener('click', () => {
        const newTier = card.dataset.tier;
        if (newTier && newTier !== currentTier) {
          currentTier = newTier;
          updatePricingCards();
          saveFormProgress();
          trackEvent('Plan_Card_Click', { tier: newTier });
        }
      });
    });
  }

  // ==========================================================================
  // Custom Dropdown
  // ==========================================================================

  function initCustomDropdown() {
    const dropdown = elements.contactSourceDropdown;
    if (!dropdown) return;

    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selectedText = dropdown.querySelector('.dropdown-selected');
    const hiddenInput = elements.contactSourceHidden;

    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !isOpen);
      menu.classList.toggle('open', !isOpen);
    });

    // Handle item selection
    items.forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.value;
        const text = item.textContent;

        // Update hidden input
        hiddenInput.value = value;

        // Update display
        selectedText.textContent = text;
        selectedText.classList.remove('placeholder');

        // Update selected state
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        // Close dropdown
        trigger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');

        // Save form progress
        saveFormProgress();
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        trigger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      }
    });

    // Keyboard navigation
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        trigger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      }
    });
  }

  function setDropdownValue(value) {
    const dropdown = elements.contactSourceDropdown;
    if (!dropdown || !value) return;

    const items = dropdown.querySelectorAll('.dropdown-item');
    const selectedText = dropdown.querySelector('.dropdown-selected');
    const hiddenInput = elements.contactSourceHidden;

    items.forEach(item => {
      if (item.dataset.value === value) {
        hiddenInput.value = value;
        selectedText.textContent = item.textContent;
        selectedText.classList.remove('placeholder');
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // ==========================================================================
  // Phase Navigation
  // ==========================================================================

  function showPhase(phaseNum) {
    // Show target phase
    const phaseEl = document.getElementById(`phase-${phaseNum}`);
    if (phaseEl) {
      phaseEl.classList.add('active');
      scrollToElement(phaseEl, 20);
    }
  }

  function initPhaseNavigation() {
    // Hero CTA -> Phase 1
    if (elements.heroCta) {
      elements.heroCta.addEventListener('click', () => {
        showPhase(1);
        trackEvent('Hero_CTA_Click');
      });
    }

    // Phase 1 CTA -> Phase 2 (with validation)
    if (elements.phase1Cta) {
      elements.phase1Cta.addEventListener('click', () => {
        // Validate: at least one relationship type must be selected
        const hasRelationshipType = Array.from(elements.checkboxes).some(cb => cb.checked);
        // Validate: primary goal must be selected
        const hasPrimaryGoal = document.querySelector('input[name="primary_goal"]:checked');

        if (!hasRelationshipType || !hasPrimaryGoal) {
          // Show validation messages
          if (!hasRelationshipType) {
            const fieldset = document.querySelector('input[name="relationship_types"]').closest('fieldset');
            fieldset.classList.add('validation-error');
            setTimeout(() => fieldset.classList.remove('validation-error'), 3000);
          }
          if (!hasPrimaryGoal) {
            const fieldset = document.querySelector('input[name="primary_goal"]').closest('fieldset');
            fieldset.classList.add('validation-error');
            setTimeout(() => fieldset.classList.remove('validation-error'), 3000);
          }
          // Scroll to first error
          const firstError = document.querySelector('.validation-error');
          if (firstError) {
            scrollToElement(firstError, 100);
          }
          return;
        }

        showPhase(2);
        trackEvent('Phase1_Completed');
        trackEvent('Pricing_Viewed');
      });
    }
  }

  // ==========================================================================
  // Application Form
  // ==========================================================================

  function collectFormData() {
    // Collect relationship types
    const relationshipTypes = [];
    elements.checkboxes.forEach(cb => {
      if (cb.checked) {
        const detail = document.querySelector(`input[name="${cb.value}_detail"]`);
        relationshipTypes.push({
          type: cb.value,
          detail: detail ? detail.value : ''
        });
      }
    });

    // Get primary goal
    const primaryGoal = document.querySelector('input[name="primary_goal"]:checked');

    return {
      relationshipTypes: JSON.stringify(relationshipTypes),
      primaryGoal: primaryGoal ? primaryGoal.value : ''
    };
  }

  function initApplicationForm() {
    if (!elements.applicationForm) return;

    elements.applicationForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const emailInput = document.getElementById('user-email');
      const emailError = document.getElementById('email-error');

      try {
        // Validate email
        if (!emailInput.value || !emailInput.validity.valid) {
          emailError.textContent = 'Please enter a valid email address';
          emailInput.focus();
          return;
        }
        emailError.textContent = '';

        // Populate hidden fields with defensive checks
        const formData = collectFormData();
        if (elements.formVariant) elements.formVariant.value = variant;
        if (elements.formTier) elements.formTier.value = currentTier;
        if (elements.formContactCount) elements.formContactCount.value = elements.contactSlider ? elements.contactSlider.value : '200';
        if (elements.formViral) elements.formViral.value = viralEnabled ? 'true' : 'false';
        if (elements.formTimestamp) elements.formTimestamp.value = new Date().toISOString();
        if (elements.formRelationshipTypes) elements.formRelationshipTypes.value = formData.relationshipTypes;
        if (elements.formPrimaryGoal) elements.formPrimaryGoal.value = formData.primaryGoal;

        // Submit form
        const data = new FormData(this);

        const response = await fetch(this.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
          trackEvent('Application_Submitted');
          localStorage.removeItem(STORAGE_KEY);
          // Hide form and show success message
          elements.applicationForm.style.display = 'none';
          document.querySelector('.invitation-notice').style.display = 'none';
          elements.applicationSuccess.classList.add('visible');
        } else {
          console.error('Formspree error:', response.status, result);
          const errorMessage = result.error || result.errors?.[0]?.message || 'Form submission failed';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Application submission error:', error);
        if (emailError) {
          // Provide more specific error messages
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            emailError.textContent = 'Network error. Please check your connection and try again.';
          } else {
            emailError.textContent = error.message || 'Something went wrong. Please try again.';
          }
        }
      }
    });
  }

  // ==========================================================================
  // LocalStorage Persistence
  // ==========================================================================

  function saveFormProgress() {
    const data = {
      contactCount: elements.contactSlider ? elements.contactSlider.value : '200',
      selectedTier: currentTier,
      relationshipTypes: [],
      primaryGoal: '',
      viralEnabled: viralEnabled,
      linkedinUrl: document.getElementById('linkedin-url')?.value || '',
      contactSource: document.getElementById('contact-source')?.value || '',
      email: document.getElementById('user-email')?.value || '',
      additionalNotes: document.getElementById('additional-notes')?.value || ''
    };

    // Collect checkbox states
    elements.checkboxes.forEach(cb => {
      if (cb.checked) {
        const detail = document.querySelector(`input[name="${cb.value}_detail"]`);
        data.relationshipTypes.push({
          type: cb.value,
          detail: detail ? detail.value : ''
        });
      }
    });

    // Get primary goal
    const primaryGoal = document.querySelector('input[name="primary_goal"]:checked');
    if (primaryGoal) {
      data.primaryGoal = primaryGoal.value;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function restoreFormProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const data = JSON.parse(saved);

      // Restore slider
      if (data.contactCount && elements.contactSlider) {
        elements.contactSlider.value = data.contactCount;
        updateSliderDisplay(data.contactCount);
      }

      // Restore selected tier (may differ from slider-derived tier if manually selected)
      if (data.selectedTier && TIERS[data.selectedTier]) {
        currentTier = data.selectedTier;
        updatePricingCards();
      }

      // Restore checkboxes
      if (data.relationshipTypes && data.relationshipTypes.length) {
        data.relationshipTypes.forEach(item => {
          const checkbox = document.querySelector(`input[name="relationship_types"][value="${item.type}"]`);
          if (checkbox) {
            checkbox.checked = true;
            const conditionalInput = document.querySelector(`.conditional-input[data-for="${item.type}"]`);
            if (conditionalInput) {
              conditionalInput.classList.add('visible');
              const detailInput = conditionalInput.querySelector('input');
              if (detailInput && item.detail) {
                detailInput.value = item.detail;
              }
            }
          }
        });
      }

      // Restore primary goal
      if (data.primaryGoal) {
        const radio = document.querySelector(`input[name="primary_goal"][value="${data.primaryGoal}"]`);
        if (radio) radio.checked = true;
      }

      // Restore viral toggle
      if (data.viralEnabled && elements.viralToggle) {
        elements.viralToggle.checked = true;
        viralEnabled = true;
        updatePricingCards();
      }

      // Restore application form fields
      const linkedinUrl = document.getElementById('linkedin-url');
      if (linkedinUrl && data.linkedinUrl) linkedinUrl.value = data.linkedinUrl;

      // Restore custom dropdown
      if (data.contactSource) setDropdownValue(data.contactSource);

      const email = document.getElementById('user-email');
      if (email && data.email) email.value = data.email;

      const notes = document.getElementById('additional-notes');
      if (notes && data.additionalNotes) notes.value = data.additionalNotes;

    } catch (error) {
      console.error('Error restoring form progress:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function initFormPersistence() {
    // Restore saved data
    restoreFormProgress();

    // Save on input changes
    document.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('change', saveFormProgress);
      input.addEventListener('input', saveFormProgress);
    });
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  function init() {
    initVariant();
    initSlider();
    initCheckboxes();
    initViralToggle();
    initPricingCardSelection();
    initCustomDropdown();
    initPhaseNavigation();
    initApplicationForm();
    initFormPersistence();

    // Update pricing cards initially
    updatePricingCards();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
