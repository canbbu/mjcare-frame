(function () {
    const ROLE_STORAGE_KEY = 'mjcare.userRole';
    const ROLE_OPTIONS = ['user', 'admin'];
    let currentRole = 'user';
    let heroModalBindings = null;
    let roleMenuBound = false;
    let heroModalKeydownBound = false;
    let previousOverflow = '';

    function boot() {
        currentRole = loadRole();
        applyRole(currentRole);
        bindRoleSwitch();
        bindHeroModal();
        document.addEventListener('sections:ready', () => {
            bindHeroModal();
            applyRole(currentRole);
        });
    }

    function loadRole() {
        try {
            const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
            if (ROLE_OPTIONS.includes(stored)) {
                return stored;
            }
        } catch (error) {
            console.warn('역할 정보를 불러오지 못했습니다.', error);
        }
        return 'user';
    }

    function saveRole(role) {
        try {
            window.localStorage.setItem(ROLE_STORAGE_KEY, role);
        } catch (error) {
            console.warn('역할 정보를 저장하지 못했습니다.', error);
        }
    }

    function applyRole(role) {
        currentRole = role;
        document.body.classList.toggle('is-admin', role === 'admin');
        document.body.dataset.role = role;

        const adminNodes = document.querySelectorAll('[data-role-visibility="admin"]');
        adminNodes.forEach((node) => {
            if (role === 'admin') {
                node.removeAttribute('hidden');
            } else if (!node.hasAttribute('hidden')) {
                node.setAttribute('hidden', '');
            }
        });

        updateRoleSwitchUI(role);
        window.dispatchEvent(new CustomEvent('user:role-change', { detail: { role } }));
    }

    function updateRoleSwitchUI(role) {
        const label = document.querySelector('[data-role-label]');
        if (label) {
            label.textContent = role === 'admin' ? '관리자 모드' : '일반 회원';
        }

        const options = document.querySelectorAll('[data-role-target]');
        options.forEach((option) => {
            const targetRole = option.getAttribute('data-role-target');
            option.classList.toggle('is-active', targetRole === role);
            option.setAttribute('aria-pressed', targetRole === role);
        });
    }

    function bindRoleSwitch() {
        if (roleMenuBound) return;
        const switchRoot = document.getElementById('userRoleSwitch');
        if (!switchRoot) return;

        const trigger = switchRoot.querySelector('.user-role-switch__trigger');
        const options = switchRoot.querySelectorAll('[data-role-target]');

        options.forEach((option) => {
            option.addEventListener('click', () => {
                const nextRole = option.getAttribute('data-role-target');
                if (!nextRole || nextRole === currentRole) return;
                applyRole(nextRole);
                saveRole(nextRole);
            });
        });

        switchRoot.addEventListener('mouseenter', () => {
            trigger?.setAttribute('aria-expanded', 'true');
        });

        switchRoot.addEventListener('mouseleave', () => {
            trigger?.setAttribute('aria-expanded', 'false');
        });

        roleMenuBound = true;
    }

    function bindHeroModal() {
        const modal = document.getElementById('heroAdminModal');
        const openBtn = document.getElementById('heroAdminModalOpen');
        const closeBtn = document.getElementById('heroAdminModalClose');
        const overlay = modal?.querySelector('[data-hero-admin-close]');

        if (!modal || !openBtn || heroModalBindings?.modal === modal) {
            return;
        }

        heroModalBindings = { modal, openBtn, closeBtn, overlay };

        const openModal = () => {
            if (currentRole !== 'admin') return;
            previousOverflow = document.body.style.overflow || '';
            document.body.style.overflow = 'hidden';
            modal.classList.add('is-active');
            modal.setAttribute('aria-hidden', 'false');
            closeBtn?.focus();
        };

        const closeModal = () => {
            modal.classList.remove('is-active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = previousOverflow;
        };

        openBtn.addEventListener('click', openModal);
        closeBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);

        if (!heroModalKeydownBound) {
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modal.classList.contains('is-active')) {
                    closeModal();
                }
            });
            heroModalKeydownBound = true;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();


