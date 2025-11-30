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
    if (!tier || tierKey === 'leader') return tier ? '1,000+' : '200';
    const base = tier.baseContacts;
    const limit = viralEnabled ? Math.floor(base * 1.5) : base;
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

      // Validate email
      const emailInput = document.getElementById('user-email');
      const emailError = document.getElementById('email-error');
      if (!emailInput.value || !emailInput.validity.valid) {
        emailError.textContent = 'Please enter a valid email address';
        emailInput.focus();
        return;
      }
      emailError.textContent = '';

      // Populate hidden fields
      const formData = collectFormData();
      elements.formVariant.value = variant;
      elements.formTier.value = currentTier;
      elements.formContactCount.value = elements.contactSlider ? elements.contactSlider.value : '200';
      elements.formViral.value = viralEnabled ? 'true' : 'false';
      elements.formTimestamp.value = new Date().toISOString();
      elements.formRelationshipTypes.value = formData.relationshipTypes;
      elements.formPrimaryGoal.value = formData.primaryGoal;

      // Submit form
      const data = new FormData(this);

      try {
        const response = await fetch(this.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          trackEvent('Application_Submitted');
          localStorage.removeItem(STORAGE_KEY);
          // Hide form and show success message
          elements.applicationForm.style.display = 'none';
          document.querySelector('.invitation-notice').style.display = 'none';
          elements.applicationSuccess.classList.add('visible');
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        console.error('Application submission error:', error);
        if (emailError) {
          emailError.textContent = 'Something went wrong. Please try again.';
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

      const contactSource = document.getElementById('contact-source');
      if (contactSource && data.contactSource) contactSource.value = data.contactSource;

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
