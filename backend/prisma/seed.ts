import {
  PrismaClient,
  ContentStatus,
  PropertyStatus,
  ReviewStatus,
  BookingStatus,
  PaymentStatus,
  ConversationType,
  HostLeadStatus,
  SupportTicketStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const legalContent = {
  terms: `
    <h2>1. Scope of the Vayento service</h2><p>These Terms and Conditions define the rules for using the Vayento platform, including browsing properties, creating an account, submitting booking requests, making payments, managing listings and communicating with hosts or administrators. Vayento is designed as a digital marketplace and operational workspace for short-term rental experiences.</p>
    <h2>2. User accounts and responsibilities</h2><p>Users must provide accurate information during registration, keep account credentials secure and immediately notify the platform if they suspect unauthorised use. Each account action is linked to the authenticated user for audit, safety and service quality purposes.</p>
    <h2>3. Bookings and payments</h2><p>Bookings are confirmed only after successful payment verification. Prices may include nightly rate, cleaning fee, service fee and taxes. A booking may remain temporarily pending while payment is processed. If payment is not completed within the allowed timeframe, the booking may expire and availability may be released.</p>
    <h2>4. Hosts and property data</h2><p>Hosts are responsible for the accuracy of property descriptions, images, amenities, rules, location information, availability and pricing. Listings may be reviewed by administrators before publication to maintain platform quality.</p>
    <h2>5. Cancellation and operational integrity</h2><p>Cancellation handling depends on the property rules, booking status, payment status and timing of the request. Vayento keeps booking, payment and audit records for operational, accounting and dispute-resolution purposes.</p>
    <h2>6. Prohibited activity</h2><p>Users may not attempt to bypass authentication, access another user's data, manipulate payment flows, upload malicious files, publish unlawful content or use the platform in a way that disrupts service integrity.</p>
    <h2>7. Limitation of liability</h2><p>The platform is provided for digital booking and management workflows. While Vayento applies reasonable security and validation controls, users remain responsible for their decisions, communications and submitted data.</p>
  `,
  privacy: `
    <h2>1. Data collected</h2><p>Vayento processes account data such as name, email, phone, profile details, booking details, payment status, messages, reviews, host lead submissions and audit events. The platform avoids exposing sensitive authentication fields such as password hashes in API responses.</p>
    <h2>2. Purpose of processing</h2><p>Data is processed to create and secure accounts, provide booking functionality, support payments, manage properties, send notifications, handle support requests, improve user experience and maintain compliance-ready operational records.</p>
    <h2>3. Authentication and security</h2><p>The system uses password hashing, access tokens, refresh tokens, route protection, role-based authorization, audit logs and validation guards. Users are responsible for choosing strong passwords and protecting their devices.</p>
    <h2>4. Payment information</h2><p>Payment processing is handled through Stripe. Vayento stores payment references, status, amount, currency and operational metadata, but does not store full card numbers.</p>
    <h2>5. Communications</h2><p>Transactional emails, booking confirmations, password reset links and host/admin notifications may be sent through configured email infrastructure. In local development, these messages are captured by Mailpit for testing.</p>
    <h2>6. Data retention</h2><p>Booking, payment, audit and support records may be retained for accounting, legal, security and dispute-management reasons. Account deactivation disables access while preserving historical records required for platform integrity.</p>
    <h2>7. User rights</h2><p>Users may update profile information, change their password, request email changes and deactivate their account. Additional requests may be handled through support channels.</p>
  `,
  cookies: `
    <h2>1. Cookie and storage usage</h2><p>Vayento may use browser storage and cookies to maintain authentication, remember session state, improve navigation and support secure user flows.</p>
    <h2>2. Essential storage</h2><p>Essential storage is required for login state, refresh flows and protected workspace access. Without it, dashboard, booking and host/admin features may not operate correctly.</p>
    <h2>3. Analytics readiness</h2><p>The platform is structured to support future analytics events such as property views, checkout starts, bookings, wishlist actions and host submissions. Analytics should be implemented with privacy-aware configuration.</p>
    <h2>4. Managing preferences</h2><p>Users can clear browser storage or use browser privacy settings. Future production versions can add granular cookie preference controls.</p>
  `,
  dataProtection: `
    <h2>1. Privacy-by-design approach</h2><p>The Vayento architecture separates public data from protected user, host and admin data. Role-based access control ensures that each user sees only the data relevant to their role.</p>
    <h2>2. Security controls</h2><p>The application includes hashed passwords, JWT access control, refresh tokens, rate limiting, account lockout, input validation, safe user serializers, media validation and Stripe webhook signature verification.</p>
    <h2>3. Auditability</h2><p>Important administrative and host actions are recorded as audit logs so that moderation, role changes, listing publication and operational changes can be reviewed.</p>
    <h2>4. Data minimisation</h2><p>Public property pages display only the information needed for discovery and booking decisions. Sensitive user fields and authentication secrets are not exposed to frontend clients.</p>
  `,
};

async function main() {
  await prisma.supportTicket.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.hostPayout.deleteMany();
  await prisma.favoriteSearch.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.hostLead.deleteMany();
  await prisma.stripeWebhookEvent.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingGuestDetails.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.propertyAvailabilityOverride.deleteMany();
  await prisma.propertyPricingRule.deleteMany();
  await prisma.availabilityBlock.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.propertyRule.deleteMany();
  await prisma.propertyLocation.deleteMany();
  await prisma.property.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.contentPage.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.create({ data: { firstName: 'Admin', lastName: 'User', email: 'admin@vayento.com', passwordHash, role: 'ADMIN', isEmailVerified: true, profile: { create: { country: 'Greece', city: 'Athens', preferredLanguage: 'en' } } } });
  const admin2 = await prisma.user.create({ data: { firstName: 'Maria', lastName: 'Ops', email: 'maria.admin@vayento.com', passwordHash, role: 'ADMIN', isEmailVerified: true, profile: { create: { country: 'Greece', city: 'Athens', preferredLanguage: 'en' } } } });
  const host1 = await prisma.user.create({ data: { firstName: 'Helena', lastName: 'Host', email: 'host@vayento.com', passwordHash, phone: '+302100000001', role: 'HOST', isEmailVerified: true, profile: { create: { country: 'Greece', city: 'Mykonos', addressLine: 'Agios Ioannis', preferredLanguage: 'en' } } } });
  const host2 = await prisma.user.create({ data: { firstName: 'Dimitris', lastName: 'Villa', email: 'dimitris.host@vayento.com', passwordHash, phone: '+302100000002', role: 'HOST', isEmailVerified: true, profile: { create: { country: 'Greece', city: 'Paros', preferredLanguage: 'el' } } } });
  const users = await Promise.all([
    ['Nikos', 'Guest', 'user@vayento.com', 'Athens'],
    ['Eleni', 'Traveler', 'eleni.traveler@vayento.com', 'Thessaloniki'],
    ['Marco', 'Rossi', 'marco.rossi@example.com', 'Rome'],
    ['Sofia', 'Martin', 'sofia.martin@example.com', 'Paris'],
    ['James', 'Brown', 'james.brown@example.com', 'London'],
    ['Anna', 'Schmidt', 'anna.schmidt@example.com', 'Berlin'],
  ].map(([firstName, lastName, email, city]) => prisma.user.create({ data: { firstName, lastName, email, passwordHash, phone: '+306900000000', role: 'USER', isEmailVerified: true, profile: { create: { country: city === 'Rome' ? 'Italy' : city === 'Paris' ? 'France' : city === 'London' ? 'United Kingdom' : city === 'Berlin' ? 'Germany' : 'Greece', city, preferredLanguage: 'en' } } } })));

  const propertyData = [
    ['Sunset Villa Mykonos','sunset-villa-mykonos','Luxury villa with infinity pool and sea views.','Villa','Mykonos','Cyclades','Agios Ioannis',520,80,45,6,3,3,true,host1.id,img('photo-1505693416388-ac5ce068fe85')],
    ['Athenian Urban Loft','athenian-urban-loft','Design-forward loft in the heart of Athens.','Apartment','Athens','Attica','Kolonaki',180,35,20,2,1,1,true,host1.id,img('photo-1502672260266-1c1ef2d93688')],
    ['Paros Garden Maisonette','paros-garden-maisonette','Quiet Cycladic maisonette with garden terrace.','House','Paros','Cyclades','Naousa',260,45,25,4,2,2,true,host2.id,img('photo-1494526585095-c41746248156')],
    ['Santorini Cave Suite','santorini-cave-suite','Minimal cave suite with caldera-inspired interiors.','Suite','Santorini','Cyclades','Oia',410,60,35,2,1,1,true,host2.id,img('photo-1618221195710-dd6b41faaea6')],
    ['Crete Stone Retreat','crete-stone-retreat','Stone-built retreat near the old harbour.','Villa','Chania','Crete','Old Town',320,55,28,5,3,2,false,host1.id,img('photo-1600585154340-be6161a56a0c')],
    ['Rhodes Old Town Residence','rhodes-old-town-residence','Restored residence inside the medieval city.','House','Rhodes','Dodecanese','Old Town',240,40,22,4,2,2,false,host2.id,img('photo-1600566753190-17f0baa2a6c3')],
    ['Naxos Beach Apartment','naxos-beach-apartment','Easy beachside apartment for relaxed island stays.','Apartment','Naxos','Cyclades','Agios Prokopios',155,30,18,3,1,1,false,host1.id,img('photo-1560448204-e02f11c3d0e2')],
    ['Corfu Olive Estate','corfu-olive-estate','Elegant estate surrounded by olive trees.','Villa','Corfu','Ionian Islands','Kassiopi',390,70,38,7,4,3,true,host2.id,img('photo-1600607687939-ce8a6c25118c')],
  ];

  const properties = [];
  for (const [title, slug, shortDescription, propertyType, city, region, addressLine, base, cleaning, service, guests, beds, baths, featured, hostId, coverUrl] of propertyData as any[]) {
    const property = await prisma.property.create({ data: {
      hostId, title, slug, shortDescription,
      longDescription: `${title} is a curated Vayento stay designed for comfort, clarity and premium presentation. The property combines thoughtful interiors, practical amenities and a location suitable for both leisure and remote working guests.`,
      propertyType, status: PropertyStatus.PUBLISHED, basePricePerNight: base, cleaningFee: cleaning, serviceFee: service, maxGuests: guests, bedrooms: beds, bathrooms: baths, featured, citySearch: city, ratingAverage: 4.7, reviewsCount: 0,
      location: { create: { country: 'Greece', city, region, addressLine } },
      amenities: { create: [
        { amenityKey: 'wifi', amenityLabel: 'High-speed Wi-Fi' },
        { amenityKey: 'aircon', amenityLabel: 'Air conditioning' },
        { amenityKey: 'kitchen', amenityLabel: 'Full kitchen' },
        ...(propertyType === 'Villa' ? [{ amenityKey: 'pool', amenityLabel: 'Pool' }, { amenityKey: 'parking', amenityLabel: 'Private parking' }] : []),
      ] },
      images: { create: [ { url: coverUrl, altText: `${title} cover image`, sortOrder: 0, isCover: true }, { url: img('photo-1600585154526-990dced4db0d'), altText: `${title} interior`, sortOrder: 1, isCover: false } ] },
      rules: { create: { checkInTime: '15:00', checkOutTime: '11:00', cancellationPolicy: 'Moderate', petsAllowed: false, smokingAllowed: false, eventsAllowed: false } },
      pricingRules: { create: [{ label: 'Summer premium', startDate: new Date('2026-07-01'), endDate: new Date('2026-08-31'), priceMultiplier: 1.25, minNights: 3 }] },
    }});
    properties.push(property);
  }

  await prisma.property.create({ data: {
    hostId: host2.id, title: 'Review Queue Villa', slug: 'review-queue-villa', shortDescription: 'Prepared listing awaiting admin moderation.', longDescription: 'This listing exists so the admin moderation queue has realistic seed data.', propertyType: 'Villa', status: PropertyStatus.REVIEW, basePricePerNight: 300, cleaningFee: 50, serviceFee: 25, maxGuests: 4, bedrooms: 2, bathrooms: 2, citySearch: 'Paros', location: { create: { country: 'Greece', city: 'Paros', region: 'Cyclades', addressLine: 'Naousa' } }, amenities: { create: [{ amenityKey: 'wifi', amenityLabel: 'High-speed Wi-Fi' }, { amenityKey: 'view', amenityLabel: 'Garden View' }] }, images: { create: [{ url: img('photo-1505693416388-ac5ce068fe85'), sortOrder: 0, isCover: true }] }, rules: { create: { cancellationPolicy: 'Moderate' } }
  }});

  const bookings = [];
  for (let i = 0; i < 12; i++) {
    const property = properties[i % properties.length];
    const guest = users[i % users.length];
    const checkIn = new Date(`2026-${String(5 + (i % 5)).padStart(2, '0')}-${String(10 + i).padStart(2, '0')}`);
    const nights = 3 + (i % 4);
    const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + nights);
    const subtotal = Number(property.basePricePerNight) * nights;
    const total = subtotal + Number(property.cleaningFee) + Number(property.serviceFee) + subtotal * 0.08;
    const status = i < 8 ? BookingStatus.CONFIRMED : i < 10 ? BookingStatus.COMPLETED : BookingStatus.AWAITING_PAYMENT;
    const paymentStatus = status === BookingStatus.AWAITING_PAYMENT ? PaymentStatus.PENDING : PaymentStatus.SUCCEEDED;
    const booking = await prisma.booking.create({ data: { propertyId: property.id, guestUserId: guest.id, hostId: property.hostId, checkInDate: checkIn, checkOutDate: checkOut, guestsCount: 1 + (i % Math.min(property.maxGuests, 4)), nights, bookingStatus: status, subtotal, cleaningFee: property.cleaningFee, serviceFee: property.serviceFee, taxes: subtotal * 0.08, totalAmount: total, currency: 'EUR', paymentStatus, expiresAt: status === BookingStatus.AWAITING_PAYMENT ? new Date(Date.now() + 15 * 60 * 1000) : null, guestDetails: { create: { firstName: guest.firstName, lastName: guest.lastName, email: guest.email, phone: guest.phone, country: 'Greece', city: 'Athens', specialRequests: i % 2 ? 'Late arrival if possible.' : null } } } });
    bookings.push(booking);
    if (paymentStatus === PaymentStatus.SUCCEEDED) await prisma.payment.create({ data: { bookingId: booking.id, userId: guest.id, provider: 'stripe', providerPaymentIntentId: `seed_pi_${i}`, amount: total, currency: 'EUR', paymentStatus: PaymentStatus.SUCCEEDED, paidAt: new Date(), cardBrand: 'visa', cardLast4: '4242' } });
    if (status !== BookingStatus.AWAITING_PAYMENT) await prisma.availabilityBlock.create({ data: { propertyId: property.id, startDate: checkIn, endDate: checkOut, blockType: 'RESERVED', reason: `Booking ${booking.id}` } });
  }

  for (let i = 0; i < 8; i++) {
    const booking = bookings[i];
    const property = properties.find((item) => item.id === booking.propertyId)!;
    const guest = users.find((item) => item.id === booking.guestUserId)!;
    await prisma.review.create({ data: { propertyId: property.id, bookingId: booking.id, authorUserId: guest.id, rating: 4 + (i % 2), title: i % 2 ? 'Beautiful and reliable' : 'Excellent stay', comment: 'The stay was well presented, clean and easy to manage through the platform.', status: i < 6 ? ReviewStatus.PUBLISHED : ReviewStatus.PENDING } });
  }

  for (const property of properties) {
    const aggregate = await prisma.review.aggregate({ where: { propertyId: property.id, status: ReviewStatus.PUBLISHED }, _avg: { rating: true }, _count: { _all: true } });
    await prisma.property.update({ where: { id: property.id }, data: { ratingAverage: aggregate._avg.rating ?? 0, reviewsCount: aggregate._count._all } });
  }

  await prisma.wishlist.createMany({ data: properties.slice(0, 5).map((property, idx) => ({ userId: users[idx % users.length].id, propertyId: property.id })), skipDuplicates: true });

  await prisma.contentPage.createMany({ data: [
    { slug: 'home', title: 'Home', metaTitle: 'Vayento Luxury Rentals', metaDescription: 'Curated stays in Greece.', content: '<p>Homepage content managed by the admin.</p>', status: ContentStatus.PUBLISHED, authorId: admin.id },
    { slug: 'about', title: 'About Vayento', metaTitle: 'About Vayento', metaDescription: 'About our platform.', content: '<p>Vayento is a premium short-term rental platform combining guest booking flows, host management and administrator controls.</p>', status: ContentStatus.PUBLISHED, authorId: admin.id },
    { slug: 'terms', title: 'Terms and Conditions', metaTitle: 'Terms and Conditions | Vayento', metaDescription: 'Terms for using the Vayento platform.', content: legalContent.terms, status: ContentStatus.PUBLISHED, authorId: admin.id },
    { slug: 'privacy', title: 'Privacy Policy', metaTitle: 'Privacy Policy | Vayento', metaDescription: 'How Vayento handles personal data.', content: legalContent.privacy, status: ContentStatus.PUBLISHED, authorId: admin.id },
    { slug: 'cookies', title: 'Cookie Policy', metaTitle: 'Cookie Policy | Vayento', metaDescription: 'Cookie and local storage usage.', content: legalContent.cookies, status: ContentStatus.PUBLISHED, authorId: admin.id },
    { slug: 'data-protection', title: 'Data Protection and Security', metaTitle: 'Data Protection | Vayento', metaDescription: 'Security and privacy controls used by Vayento.', content: legalContent.dataProtection, status: ContentStatus.PUBLISHED, authorId: admin.id },
  ] });

  await prisma.blogPost.createMany({ data: [
    { title: 'Summer Villas in Greece', slug: 'summer-villas-in-greece', excerpt: 'Our curated summer escapes.', body: '<p>Discover villas with refined presentation, transparent booking flows and host-managed availability.</p>', coverImageUrl: img('photo-1507525428034-b723cf961d3e'), status: ContentStatus.PUBLISHED, publishedAt: new Date('2026-03-02'), authorId: admin.id, metaTitle: 'Summer Villas in Greece | Vayento', metaDescription: 'Premium villas for summer travel.' },
    { title: 'How to Prepare a Premium Listing', slug: 'prepare-premium-listing', excerpt: 'Photography, amenities and trust signals for hosts.', body: '<p>A premium listing combines strong images, accurate amenities, clear rules and availability discipline.</p>', coverImageUrl: img('photo-1600585154340-be6161a56a0c'), status: ContentStatus.PUBLISHED, publishedAt: new Date('2026-03-08'), authorId: admin2.id },
    { title: 'Athens for Design-Focused Travelers', slug: 'athens-design-travelers', excerpt: 'Urban stays with culture and comfort.', body: '<p>Athens combines walkable neighbourhoods, food culture and design-forward apartments.</p>', coverImageUrl: img('photo-1502672260266-1c1ef2d93688'), status: ContentStatus.PUBLISHED, publishedAt: new Date('2026-03-12'), authorId: admin.id },
    { title: 'Booking Flow Trust Checklist', slug: 'booking-flow-trust-checklist', excerpt: 'What makes guests confident during checkout.', body: '<p>Clear pricing, secure payments, confirmation emails and user dashboards all contribute to trust.</p>', coverImageUrl: img('photo-1556742049-0cfed4f6a45d'), status: ContentStatus.PUBLISHED, publishedAt: new Date('2026-03-16'), authorId: admin2.id },
    { title: 'Island Stays with Remote Work Comfort', slug: 'island-stays-remote-work', excerpt: 'Amenities that matter for longer stays.', body: '<p>Wi-Fi, workspaces, natural light and predictable check-in rules are essential for remote work guests.</p>', coverImageUrl: img('photo-1494526585095-c41746248156'), status: ContentStatus.DRAFT, authorId: admin.id },
  ] });

  await prisma.hostLead.createMany({ data: [
    { firstName: 'Alexandros', lastName: 'Owner', email: 'alex.owner@example.com', phone: '+306900000001', propertyCity: 'Milos', propertyCountry: 'Greece', propertyType: 'Villa', message: 'Interested in listing a sea-view villa.' },
    { firstName: 'Irene', lastName: 'Manager', email: 'irene.manager@example.com', phone: '+306900000002', propertyCity: 'Athens', propertyCountry: 'Greece', propertyType: 'Apartment', message: 'I manage three apartments in central Athens.' },
    { firstName: 'Luca', lastName: 'Bianchi', email: 'luca.bianchi@example.com', propertyCity: 'Corfu', propertyCountry: 'Greece', propertyType: 'House', status: HostLeadStatus.CONTACTED },
    { firstName: 'Petra', lastName: 'Novak', email: 'petra.novak@example.com', propertyCity: 'Naxos', propertyCountry: 'Greece', propertyType: 'Suite', status: HostLeadStatus.NEW },
  ] });

  const supportConversation = await prisma.conversation.create({ data: { type: ConversationType.SUPPORT } });
  await prisma.conversationParticipant.createMany({ data: [{ conversationId: supportConversation.id, userId: admin.id }, { conversationId: supportConversation.id, userId: users[0].id }] });
  await prisma.message.createMany({ data: [{ conversationId: supportConversation.id, senderUserId: users[0].id, body: 'Hello, I need help with my booking.' }, { conversationId: supportConversation.id, senderUserId: admin.id, body: 'Of course, we are reviewing your request.' }] });
  await prisma.supportTicket.create({ data: { requesterId: users[0].id, conversationId: supportConversation.id, subject: 'Booking support request', status: SupportTicketStatus.OPEN, category: 'Booking', priority: 'Normal' } });

  await prisma.notificationLog.createMany({ data: [
    { userId: users[0].id, recipient: users[0].email, type: 'BOOKING_CONFIRMATION', status: 'SENT', sentAt: new Date() },
    { userId: host1.id, recipient: host1.email, type: 'HOST_BOOKING_ALERT', status: 'SENT', sentAt: new Date() },
    { recipient: 'admin@vayento.local', type: 'ADMIN_ALERT', status: 'SENT', sentAt: new Date() },
  ] });

  await prisma.auditLog.createMany({ data: [
    { actorUserId: admin.id, action: 'SEED_BOOTSTRAP', entityType: 'SYSTEM', entityId: 'initial-seed', metadataJson: { ok: true } },
    { actorUserId: admin.id, action: 'ADMIN_CREATED_BLOG_POST', entityType: 'BLOG_POST', entityId: 'seed-blog', metadataJson: { count: 5 } },
    { actorUserId: host1.id, action: 'HOST_CREATED_PROPERTY_DRAFT', entityType: 'PROPERTY', entityId: properties[0].id },
    { actorUserId: admin2.id, action: 'ADMIN_REVIEWED_PROPERTY', entityType: 'PROPERTY', entityId: properties[1].id },
  ] });

  console.log('Seed completed: admin@vayento.com, host@vayento.com, user@vayento.com all use Password123!');
}

main().finally(async () => { await prisma.$disconnect(); });
