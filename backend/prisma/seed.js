'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  await prisma.$transaction(async (tx) => {
    // ─── Pet Owners ────────────────────────────────────────────────────────────
    const ownerPassword = await bcrypt.hash('password123', 10);

    const mahboob = await tx.user.upsert({
      where: { email: 'mahboob@example.com' },
      update: {},
      create: {
        email: 'mahboob@example.com',
        passwordHash: ownerPassword,
        name: 'Mahboob Rabin',
        role: 'PET_OWNER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mahboob',
      },
    });

    const priya = await tx.user.upsert({
      where: { email: 'priya@example.com' },
      update: {},
      create: {
        email: 'priya@example.com',
        passwordHash: ownerPassword,
        name: 'Priya Sharma',
        role: 'PET_OWNER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      },
    });

    // ─── Vets ──────────────────────────────────────────────────────────────────
    const vetPassword = await bcrypt.hash('password123', 10);

    const aisha = await tx.user.upsert({
      where: { email: 'aisha.rahman@pawpet.vet' },
      update: {},
      create: {
        email: 'aisha.rahman@pawpet.vet',
        passwordHash: vetPassword,
        name: 'Dr. Aisha Rahman',
        role: 'VET',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
      },
    });

    const tanvir = await tx.user.upsert({
      where: { email: 'tanvir.ahmed@pawpet.vet' },
      update: {},
      create: {
        email: 'tanvir.ahmed@pawpet.vet',
        passwordHash: vetPassword,
        name: 'Dr. Tanvir Ahmed',
        role: 'VET',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanvir',
      },
    });

    const mitu = await tx.user.upsert({
      where: { email: 'mitu.saha@pawpet.vet' },
      update: {},
      create: {
        email: 'mitu.saha@pawpet.vet',
        passwordHash: vetPassword,
        name: 'Dr. Mitu Saha',
        role: 'VET',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mitu',
      },
    });

    const shohel = await tx.user.upsert({
      where: { email: 'shohel.islam@pawpet.vet' },
      update: {},
      create: {
        email: 'shohel.islam@pawpet.vet',
        passwordHash: vetPassword,
        name: 'Dr. Shohel Islam',
        role: 'VET',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shohel',
      },
    });

    const piya = await tx.user.upsert({
      where: { email: 'piya.nandi@pawpet.vet' },
      update: {},
      create: {
        email: 'piya.nandi@pawpet.vet',
        passwordHash: vetPassword,
        name: 'Dr. Piya Nandi',
        role: 'VET',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=piya',
      },
    });

    const kamal = await tx.user.upsert({
      where: { email: 'kamal.hossain@pawpet.vet' },
      update: {},
      create: {
        email: 'kamal.hossain@pawpet.vet',
        passwordHash: vetPassword,
        name: 'Dr. Kamal Hossain',
        role: 'VET',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kamal',
      },
    });

    // ─── Vet Profiles ──────────────────────────────────────────────────────────
    await tx.vetProfile.upsert({
      where: { userId: aisha.id },
      update: { isOnline: true },
      create: {
        userId: aisha.id,
        specialty: 'Small Animal Medicine',
        experienceYears: 6,
        rating: 4.9,
        reviewsCount: 127,
        languages: ['Bengali', 'English'],
        bio: 'Specialist in small animal internal medicine with a passion for preventive care. Completed advanced training at BAU and University of Edinburgh.',
        consultationFee: 799,
        urgentFee: 999,
        responseTimeMinutes: 5,
        isOnline: true,
        isVerified: true,
        qualifications: ['DVM - Bangladesh Agricultural University', 'MVSc - Internal Medicine', 'Certificate in Small Animal Medicine - Royal College'],
      },
    });

    await tx.vetProfile.upsert({
      where: { userId: tanvir.id },
      update: { isOnline: true },
      create: {
        userId: tanvir.id,
        specialty: 'Internal Medicine',
        experienceYears: 8,
        rating: 4.8,
        reviewsCount: 214,
        languages: ['Bengali', 'English', 'Hindi'],
        bio: 'Internal medicine specialist with expertise in diagnosis and management of complex diseases in companion animals.',
        consultationFee: 699,
        urgentFee: 899,
        responseTimeMinutes: 8,
        isOnline: true,
        isVerified: true,
        qualifications: ['DVM - Chittagong Veterinary University', 'MVSc - Internal Medicine', 'PhD Candidate - Infectious Diseases'],
      },
    });

    await tx.vetProfile.upsert({
      where: { userId: mitu.id },
      update: { isOnline: true },
      create: {
        userId: mitu.id,
        specialty: 'Dermatology',
        experienceYears: 5,
        rating: 4.8,
        reviewsCount: 98,
        languages: ['Bengali', 'English'],
        bio: 'Veterinary dermatologist specializing in skin, coat, and allergy conditions. Trained in advanced dermatological procedures.',
        consultationFee: 649,
        urgentFee: 849,
        responseTimeMinutes: 10,
        isOnline: true,
        isVerified: true,
        qualifications: ['DVM - Sylhet Agricultural University', 'Diploma in Veterinary Dermatology', 'Member - World Association for Veterinary Dermatology'],
      },
    });

    await tx.vetProfile.upsert({
      where: { userId: shohel.id },
      update: { isOnline: true },
      create: {
        userId: shohel.id,
        specialty: 'Surgery',
        experienceYears: 10,
        rating: 4.7,
        reviewsCount: 183,
        languages: ['Bengali', 'English'],
        bio: 'Experienced veterinary surgeon with 10 years in soft tissue and orthopedic surgery. Available for chat consultations and pre/post-surgical advice.',
        consultationFee: 499,
        urgentFee: 699,
        responseTimeMinutes: 12,
        isOnline: true,
        isVerified: true,
        qualifications: ['DVM - Bangladesh Agricultural University', 'MVSc - Surgery & Radiology', 'Certificate in Advanced Surgical Techniques'],
      },
    });

    await tx.vetProfile.upsert({
      where: { userId: piya.id },
      update: { isOnline: false },
      create: {
        userId: piya.id,
        specialty: 'Nutrition & Wellness',
        experienceYears: 4,
        rating: 4.6,
        reviewsCount: 76,
        languages: ['Bengali', 'English', 'Hindi'],
        bio: 'Certified veterinary nutritionist helping pets live longer, healthier lives through evidence-based dietary guidance.',
        consultationFee: 399,
        urgentFee: 599,
        responseTimeMinutes: 15,
        isOnline: false,
        isVerified: true,
        qualifications: ['DVM - Rajshahi Agricultural University', 'Certificate in Veterinary Nutrition - WSAVA', 'Member - American Academy of Veterinary Nutrition'],
      },
    });

    await tx.vetProfile.upsert({
      where: { userId: kamal.id },
      update: { isOnline: true },
      create: {
        userId: kamal.id,
        specialty: 'General Practice',
        experienceYears: 12,
        rating: 4.5,
        reviewsCount: 341,
        languages: ['Bengali', 'English'],
        bio: 'Seasoned general practitioner with over a decade of experience treating all species. Your first point of contact for any pet health concern.',
        consultationFee: 550,
        urgentFee: 750,
        responseTimeMinutes: 7,
        isOnline: true,
        isVerified: true,
        qualifications: ['DVM - Bangladesh Agricultural University', 'MVSc - Pharmacology', 'Diplomate - Bangladesh Veterinary Council'],
      },
    });

    // ─── Pets ──────────────────────────────────────────────────────────────────
    const bruno = await tx.pet.upsert({
      where: { id: 'pet-bruno-001' },
      update: {},
      create: {
        id: 'pet-bruno-001',
        ownerId: mahboob.id,
        name: 'Bruno',
        species: 'DOG',
        breed: 'Golden Retriever',
        age: 2,
        sex: 'MALE',
        photoUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200',
        medicalHistory: 'Vaccinated. Neutered. Mild seasonal allergies.',
      },
    });

    const buddy = await tx.pet.upsert({
      where: { id: 'pet-buddy-001' },
      update: {},
      create: {
        id: 'pet-buddy-001',
        ownerId: priya.id,
        name: 'Buddy',
        species: 'DOG',
        breed: 'Golden Retriever',
        age: 2,
        sex: 'MALE',
        photoUrl: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=200',
        medicalHistory: 'Vaccinated. No known conditions.',
      },
    });

    const whiskers = await tx.pet.upsert({
      where: { id: 'pet-whiskers-001' },
      update: {},
      create: {
        id: 'pet-whiskers-001',
        ownerId: mahboob.id,
        name: 'Whiskers',
        species: 'CAT',
        breed: 'Indie Cat',
        age: 3,
        sex: 'MALE',
        photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
        medicalHistory: 'Vaccinated. Spayed. Indoor only.',
      },
    });

    // ─── Consultations ─────────────────────────────────────────────────────────
    const consultation1 = await tx.consultation.upsert({
      where: { id: 'consult-001' },
      update: {},
      create: {
        id: 'consult-001',
        petId: bruno.id,
        ownerId: mahboob.id,
        vetId: aisha.id,
        type: 'REGULAR',
        status: 'COMPLETED',
        symptoms: 'Bruno has been scratching his ears excessively for the past week. There is some redness visible inside the ear.',
        urgencyLevel: 'LOW',
        durationMinutes: 20,
        consultationFee: 799,
        platformFee: 50,
        promoDiscount: 0,
        consultMode: 'VIDEO',
        jitsiRoomId: 'pawpet-consult-001-completed',
        scheduledTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    const consultation2 = await tx.consultation.upsert({
      where: { id: 'consult-002' },
      update: {},
      create: {
        id: 'consult-002',
        petId: whiskers.id,
        ownerId: mahboob.id,
        vetId: tanvir.id,
        type: 'URGENT',
        status: 'IN_PROGRESS',
        symptoms: 'Whiskers stopped eating since yesterday. Seems lethargic and hiding under the bed. Possible fever.',
        urgencyLevel: 'HIGH',
        durationMinutes: 20,
        consultationFee: 899,
        platformFee: 50,
        promoDiscount: 0,
        consultMode: 'VIDEO',
        jitsiRoomId: 'pawpet-consult-002-live',
        scheduledTime: new Date(),
      },
    });

    const consultation3 = await tx.consultation.upsert({
      where: { id: 'consult-003' },
      update: {},
      create: {
        id: 'consult-003',
        petId: buddy.id,
        ownerId: priya.id,
        vetId: null,
        type: 'REGULAR',
        status: 'PENDING',
        symptoms: 'Buddy needs a routine annual check-up and vaccination update. Also want to discuss his diet.',
        urgencyLevel: 'LOW',
        durationMinutes: 30,
        consultationFee: 550,
        platformFee: 50,
        promoDiscount: 50,
        consultMode: 'VIDEO',
        scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    });

    // ─── Payments ──────────────────────────────────────────────────────────────
    await tx.payment.upsert({
      where: { consultationId: consultation1.id },
      update: {},
      create: {
        consultationId: consultation1.id,
        amount: 849,
        method: 'BKASH',
        status: 'CONFIRMED',
        transactionId: 'BKS20240115001234',
      },
    });

    await tx.payment.upsert({
      where: { consultationId: consultation2.id },
      update: {},
      create: {
        consultationId: consultation2.id,
        amount: 949,
        method: 'CARD',
        status: 'CONFIRMED',
        transactionId: 'CARD20240115005678',
      },
    });

    await tx.payment.upsert({
      where: { consultationId: consultation3.id },
      update: {},
      create: {
        consultationId: consultation3.id,
        amount: 550,
        method: 'NAGAD',
        status: 'PENDING',
        transactionId: null,
      },
    });

    // ─── Reviews ───────────────────────────────────────────────────────────────
    await tx.review.upsert({
      where: { consultationId: consultation1.id },
      update: {},
      create: {
        consultationId: consultation1.id,
        reviewerId: mahboob.id,
        vetId: aisha.id,
        rating: 5,
        comment: 'Dr. Aisha was incredibly thorough and patient. Bruno is already feeling better after following her advice. Highly recommend!',
      },
    });

    // ─── Community Posts ───────────────────────────────────────────────────────
    await tx.communityPost.upsert({
      where: { id: 'post-001' },
      update: {},
      create: {
        id: 'post-001',
        authorId: mahboob.id,
        category: 'URGENT_RESCUE',
        title: 'Injured stray dog found near Dhanmondi Lake',
        content: 'Found an injured stray dog near Dhanmondi Lake. Has a wound on its left front leg. Looking for a vet or rescue organization who can help urgently. Please contact ASAP.',
        location: 'Dhanmondi, Dhaka',
        responseCount: 7,
        status: 'ACTIVE',
      },
    });

    await tx.communityPost.upsert({
      where: { id: 'post-002' },
      update: {},
      create: {
        id: 'post-002',
        authorId: priya.id,
        category: 'LOST_FOUND',
        title: 'Lost: Orange tabby cat near Gulshan 2',
        content: 'My orange tabby cat "Mango" went missing on May 12th. Last seen near Gulshan 2 circle. He is microchipped and neutered. Please call if found.',
        location: 'Gulshan 2, Dhaka',
        responseCount: 12,
        status: 'ACTIVE',
      },
    });

    await tx.communityPost.upsert({
      where: { id: 'post-003' },
      update: {},
      create: {
        id: 'post-003',
        authorId: mahboob.id,
        category: 'ADOPTION',
        title: '3 adorable kittens looking for forever homes',
        content: 'Three 8-week-old kittens ready for adoption: 1 orange (male), 2 tabbies (female). Vaccinated, dewormed, litter trained. Good with kids. Free adoption but screening required.',
        location: 'Mirpur, Dhaka',
        responseCount: 24,
        status: 'ACTIVE',
      },
    });

    await tx.communityPost.upsert({
      where: { id: 'post-004' },
      update: {},
      create: {
        id: 'post-004',
        authorId: priya.id,
        category: 'MEDICAL_HELP',
        title: 'Need advice: Dog not eating for 3 days',
        content: 'My 4-year-old Labrador stopped eating 3 days ago. He drinks water but refuses all food. No vomiting, energy seems normal. Had his regular vaccines last month. Any vets or experienced owners with advice?',
        location: 'Uttara, Dhaka',
        responseCount: 18,
        status: 'ACTIVE',
      },
    });

    await tx.communityPost.upsert({
      where: { id: 'post-005' },
      update: {},
      create: {
        id: 'post-005',
        authorId: mahboob.id,
        category: 'SUCCESS_STORIES',
        title: 'Bruno is fully recovered! Thank you PawPet vets!',
        content: "6 weeks ago Bruno was diagnosed with a severe ear infection. Thanks to Dr. Aisha's expert care via PawPet, he's completely recovered! The video consultation was so convenient and professional. Can't recommend PawPet enough!",
        location: 'Banani, Dhaka',
        responseCount: 31,
        status: 'ACTIVE',
      },
    });

    console.log('Seed completed successfully!');
    console.log(`Created owners: ${mahboob.name}, ${priya.name}`);
    console.log(`Created vets: Dr. Aisha Rahman, Dr. Tanvir Ahmed, Dr. Mitu Saha, Dr. Shohel Islam, Dr. Piya Nandi, Dr. Kamal Hossain`);
    console.log(`Created pets: Bruno, Buddy, Whiskers`);
    console.log(`Created consultations: 3 (completed, in-progress, pending)`);
    console.log(`Created community posts: 5`);
  });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
