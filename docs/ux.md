The experience should be super simple, like creating a Linktree profile.

# User Journey

1. Landing Page (for promotion and prompts Create account / Sign in)
2. Create account / Sign in
3. Dashboard with overview of all features
4. Manage Profile
   1. View Profile as Owner
   2. View Profile as Visitor
   3. Edit Profile Details: Edit basic info about yourself (as researcher)
   4. Customise Profile: Basic styling options (out of scop for MVP!!!)
   5. Share profile
      1. View link as QR Code
      2. Copy link to clipboard
5. Manage Research Links
   1. View 'All Research' (with Zero Data State)
   2. Add Research: Add a DOI, and system uses CrossRef API to grab title, abstract, authors, publication details etc.
   3. Import from ORCID (out of scop for MVP!!!)
   4. Import from Google Scholar Profile (out of scop for MVP!!!)
6. Manage Events
   1. View 'All Events' (with Zero Data State)
   2. Add Event: Add upcoming/past conferences
7. Manage WebLinks
   1. View 'All WebLinks' (with Zero Data State)
   2. Add WebLinks Form: inc social media profiles
   3.
8.  Share profile
   1. accessible from Dashboard, copy to profile
   2. from profile, visible to allV
      1. view as QR code

# url structure

> [!IMPORTANT]
> State is always preserved in the URL

- landing page =
  - domain root = https://lanyard.at
- auth
  - on a path
  - https://lanyard.at/auth
- dashboard =
  - on a subdomain =
  - https://app.lanyard.at
- view content =
  - on a path, in the subdomain
  - e.g. https://app.lanyard.at/weblinks
- edit content =
  - on a path, in the subdomain
  - e.g. https://app.lanyard.at/weblinks/edit?ID=someID
  - e.g. https://app.lanyard.at/weblinks/create
- profile =
    - path based on [handle]
    - https://lanyard.at/[handle]
      - https://lanyard.at/@renderg.host
      - https://lanyard.at/@alice.bsky.social
    - potentially different actions available for authenticated users on their own profile

# Responsiveness

The majority of users will use this from their phone, so keep design single-column and user cards, not tables, for lists of objects (e.g. list of research works).

> [!IMPORTANT]
> Desktop breakpoints are not important in the MVP!!!
>
> [!NOTE]
> Focus on the 'sm': '640px' tailwind breakpoint and below!

* Landing Page = Mobile First
* Dashboard = Mobile First
* Forms + Flows  = Mobile First
* Public Profile  = Mobile First

