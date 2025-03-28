# Navigation Menu Cleanup Plan - MyABAJobs Refresh

**Date:** March 27, 2025

**Objective:** To update the navigation menu data in `superio/data/mainMenuData.js` and `superio/data/mobileMenuData.js` to reflect the pruned pages in `superio/app/` and align with the project requirements.

**Confirmed Requirements:**

1.  **Ecommerce for Job Postings:** Keep functionality for purchasing job postings (Pricing, Cart, Checkout, Order Confirmation). Remove generic shop pages.
2.  **Main Navigation Pages:** Include Home, Browse Jobs, Employers, Candidates, Blog, Pricing, About, Contact, and Cart.
3.  **Dashboard Links:** Access only post-login, remove from public navigation.
4.  **Menu Labels:** Use the labels specified above.
5.  **Structure:** Use a flat array structure for the main navigation items in both data files.

**Plan Steps:**

1.  **Simplify Data Structure:** Refactor both `mainMenuData.js` and `mobileMenuData.js` to use a single, flat array for primary navigation links.
2.  **Define Core Menu Items:** Create the main navigation array with objects for:
    *   Home (`/home-3`)
    *   Browse Jobs (`/job-list-v2`)
    *   Employers (`/employers-list-v1`)
    *   Candidates (`/candidates-list-v1`)
    *   Blog (`/blog-list-v1`)
    *   Pricing (`/pricing`)
    *   About (`/about`)
    *   Contact (`/contact`)
    *   Cart (`/shop/cart`)
3.  **Remove Unused Items:** Delete all menu items referencing pruned pages from both files.
4.  **Remove Dashboard Links:** Delete the "Dashboard" section from both files.
5.  **Handle Single Pages:** Ensure no direct links to single item pages (Job Single, Employer Single, etc.) exist in the navigation data.
6.  **Update Both Files:** Apply the same simplified structure and links to both `mainMenuData.js` and `mobileMenuData.js`.

**Visual Representation (Mermaid Diagram):**

```mermaid
graph TD
    subgraph Main Navigation
        A[Home] --> B(Browse Jobs);
        B --> C(Employers);
        C --> D(Candidates);
        D --> E(Blog);
        E --> F(Pricing);
        F --> G(About);
        G --> H(Contact);
        H --> I(Cart);
    end

    subgraph User Actions (Separate Buttons/Links)
        J(Post a Job) --> K{Login/Register};
        L(Sign Up) --> K;
        M(Login) --> K;
    end

    subgraph Post-Login Access
        K --> N(Employer Dashboard);
        K --> O(Candidate Dashboard);
    end

    subgraph Purchase Flow
        F -- Add to Cart --> I;
        I --> P(Checkout);
        P --> Q(Order Completed);
    end

    %% Page Links
    click A "/home-3" "Go to Home"
    click B "/job-list-v2" "Go to Job List"
    click C "/employers-list-v1" "Go to Employers List"
    click D "/candidates-list-v1" "Go to Candidates List"
    click E "/blog-list-v1" "Go to Blog"
    click F "/pricing" "Go to Pricing"
    click G "/about" "Go to About"
    click H "/contact" "Go to Contact"
    click I "/shop/cart" "Go to Cart"
    click P "/shop/checkout" "Go to Checkout"
    click Q "/shop/order-completed" "Go to Order Confirmation"
    click L "/register" "Go to Register"
    click M "/login" "Go to Login"
    click N "/employers-dashboard/dashboard" "Go to Employer Dashboard"
    click O "/candidates-dashboard/dashboard" "Go to Candidate Dashboard"

```

**Summary of Changes:**

*   **`mainMenuData.js`:** Replace existing exports with a single default export array containing the 9 core items.
*   **`mobileMenuData.js`:** Replace the existing `module.exports` array with a new array containing objects for the same 9 core items.