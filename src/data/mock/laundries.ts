import type { Laundry } from '@/src/types/laundry';

export type { Laundry, LaundryService, LaundryReview } from '@/src/types/laundry';

export const laundries: Laundry[] = [
  {
    id: 'laundry-1',
    name: 'CleanWave Laundry',
    rating: 4.8,
    distanceKm: 1.2,
    etaMinutes: 35,
    startingPrice: 2.5,
    currency: '$',
    isOpen: true,
    pickupWindow: 'Today, 2:00 PM – 4:00 PM',
    deliveryWindow: 'Tomorrow, 10:00 AM – 12:00 PM',
    services: [
      { id: 'wash-fold', label: 'Wash & Fold', price: 2.5 },
      { id: 'dry-cleaning', label: 'Dry Cleaning', price: 4.5 },
      { id: 'ironing', label: 'Ironing', price: 1.5 },
      { id: 'express', label: 'Express', price: 6.0 },
    ],
    reviews: [
      {
        id: 'review-1-1',
        author: 'Sophea',
        rating: 5,
        comment: 'Fast pickup and my clothes came back perfectly folded. Highly recommend!',
      },
      {
        id: 'review-1-2',
        author: 'Ratana',
        rating: 4.5,
        comment: 'Great quality wash, delivery was right on time.',
      },
    ],
  },
  {
    id: 'laundry-2',
    name: 'Angkor Fresh Laundry',
    rating: 4.6,
    distanceKm: 2.4,
    etaMinutes: 45,
    startingPrice: 3,
    currency: '$',
    isOpen: true,
    pickupWindow: 'Today, 3:00 PM – 5:00 PM',
    deliveryWindow: 'Tomorrow, 1:00 PM – 3:00 PM',
    services: [
      { id: 'wash-fold', label: 'Wash & Fold', price: 3.0 },
      { id: 'dry-cleaning', label: 'Dry Cleaning', price: 5.0 },
      { id: 'ironing', label: 'Ironing', price: 1.8 },
      { id: 'express', label: 'Express', price: 6.5 },
    ],
    reviews: [
      {
        id: 'review-2-1',
        author: 'Dara',
        rating: 4.5,
        comment: 'Clothes smell amazing and the app updates were clear.',
      },
      {
        id: 'review-2-2',
        author: 'Sreymom',
        rating: 4.5,
        comment: 'Good service overall, slightly late on delivery once.',
      },
    ],
  },
  {
    id: 'laundry-3',
    name: 'BlueWash Express',
    rating: 4.9,
    distanceKm: 0.8,
    etaMinutes: 25,
    startingPrice: 3.5,
    currency: '$',
    isOpen: false,
    pickupWindow: 'Tomorrow, 9:00 AM – 11:00 AM',
    deliveryWindow: 'Tomorrow, 6:00 PM – 8:00 PM',
    services: [
      { id: 'wash-fold', label: 'Wash & Fold', price: 3.5 },
      { id: 'dry-cleaning', label: 'Dry Cleaning', price: 5.5 },
      { id: 'ironing', label: 'Ironing', price: 2.0 },
      { id: 'express', label: 'Express', price: 7.0 },
    ],
    reviews: [
      {
        id: 'review-3-1',
        author: 'Vichea',
        rating: 5,
        comment: 'The fastest turnaround I have found in Siem Reap.',
      },
      {
        id: 'review-3-2',
        author: 'Chenda',
        rating: 4.5,
        comment: 'Premium quality, worth the slightly higher price.',
      },
    ],
  },
  {
    id: 'laundry-4',
    name: 'Riverside Laundry Co.',
    rating: 4.5,
    distanceKm: 3.1,
    etaMinutes: 50,
    startingPrice: 2.8,
    currency: '$',
    isOpen: true,
    pickupWindow: 'Today, 4:00 PM – 6:00 PM',
    deliveryWindow: 'Tomorrow, 2:00 PM – 4:00 PM',
    services: [
      { id: 'wash-fold', label: 'Wash & Fold', price: 2.8 },
      { id: 'dry-cleaning', label: 'Dry Cleaning', price: 4.8 },
      { id: 'ironing', label: 'Ironing', price: 1.6 },
      { id: 'express', label: 'Express', price: 6.2 },
    ],
    reviews: [
      {
        id: 'review-4-1',
        author: 'Bopha',
        rating: 4.5,
        comment: 'Friendly staff and consistent quality every time.',
      },
      {
        id: 'review-4-2',
        author: 'Piseth',
        rating: 4,
        comment: 'Solid choice for regular wash and fold.',
      },
    ],
  },
];
