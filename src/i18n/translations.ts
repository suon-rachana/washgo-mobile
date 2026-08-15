import type { Language } from "@/src/store/settingsStore";

/**
 * WashGo translation dictionary.
 * Single source of truth for user-facing copy — screens look up strings by
 * key through useTranslation() instead of hardcoding English text.
 */

export type TranslationKey =
  // Bottom tabs
  | "home"
  | "orders"
  | "laundries"
  | "profile"
  // Profile menu / common screens
  | "settings"
  | "notifications"
  | "savedAddresses"
  | "paymentMethods"
  | "favoriteLaundries"
  | "helpCenter"
  | "aboutWashGo"
  | "logout"
  // Common actions / booking flow labels
  | "searchLaundries"
  | "bookNow"
  | "requestPickup"
  | "schedulePickup"
  | "chooseALaundry"
  | "chooseServices"
  | "pickupDetails"
  | "orderSummary"
  | "paymentMethod"
  | "orderTracking"
  | "orderDetails"
  | "backToHome"
  // Orders tab
  | "ordersSubtitle"
  | "active"
  | "history"
  | "noActiveOrders"
  | "noActiveOrdersDescription"
  | "noOrderHistory"
  | "noOrderHistoryDescription"
  | "bookLaundry"
  | "trackOrder"
  | "viewDetails"
  | "estimatedArrival"
  | "scheduledPickup"
  | "total"
  | "completed"
  | "cancelled"
  | "orderNotFound"
  // Order step / status labels (shared by Orders, Tracking, Order Details badges & timeline)
  | "orderStepPlaced"
  | "orderStepRiderAssigned"
  | "orderStepPickedUp"
  | "orderStepAtLaundryShop"
  | "orderStepWashing"
  | "orderStepReadyForDelivery"
  | "orderStepOutForDelivery"
  | "orderStepDelivered"
  // Profile module
  | "account"
  | "support"
  | "editProfile"
  | "personalInformation"
  | "preferences"
  | "appearance"
  | "light"
  | "dark"
  | "system"
  | "contactSupport"
  | "termsAndPrivacy"
  | "saveChanges"
  | "fullName"
  | "phoneNumber"
  | "emailAddress"
  | "addAddress"
  | "editAddress"
  | "deleteAddress"
  | "setAsDefault"
  | "default"
  | "cashOnDelivery"
  | "comingSoon"
  | "frequentlyAskedQuestions"
  | "contactSupportDetails"
  | "changesSaved"
  | "invalidEmail"
  | "requiredField"
  // Settings screen
  | "manageAppPreferences"
  | "theme"
  | "lightMode"
  | "darkMode"
  | "language"
  | "english"
  | "khmer"
  | "pushNotifications"
  | "currency"
  | "appVersion"
  // Profile screen
  | "myOrders"
  | "regularMember"
  | "logOutConfirmTitle"
  | "logOutConfirmMessage"
  | "cancel"
  // Home screen
  | "goodMorning"
  | "letUsHandleYourLaundry"
  | "searchLaundriesOrServices"
  | "categories"
  | "nearbyLaundries"
  | "seeAll"
  | "popularServices"
  | "noLaundriesFound"
  | "noLaundriesFoundDescription"
  // Map / location picker
  | "chooseOnMap"
  | "chooseLocation"
  | "moveMapToSelectPickupPoint"
  | "selectedLocation"
  | "confirmLocation"
  | "currentLocation"
  | "latitude"
  | "longitude"
  | "selectedCoordinates"
  | "locationPermissionRequired"
  | "locationPermissionMessage"
  | "unableToGetCurrentLocation"
  | "locatingYou"
  | "mapUnavailable"
  | "mapFallbackMessage"
  // Notifications module
  | "all"
  | "unread"
  | "markAllAsRead"
  | "noNotifications"
  | "notificationsEmptyDescription"
  | "youAreAllCaughtUp"
  | "noUnreadNotificationsDescription"
  | "justNow"
  | "minutesAgo"
  | "hoursAgo"
  | "yesterday"
  | "newNotification"
  | "readNotification"
  | "notifOrderCreatedTitle"
  | "notifOrderCreatedMessage"
  | "notifRiderAssignedTitle"
  | "notifRiderAssignedMessage"
  | "notifPickupStartedTitle"
  | "notifPickupStartedMessage"
  | "notifPickedUpTitle"
  | "notifPickedUpMessage"
  | "notifWashingTitle"
  | "notifWashingMessage"
  | "notifReadyTitle"
  | "notifReadyMessage"
  | "notifOutForDeliveryTitle"
  | "notifOutForDeliveryMessage"
  | "notifDeliveredTitle"
  | "notifDeliveredMessage"
  | "notifPromotionTitle"
  | "notifPromotionMessage"
  | "notifSystemTitle"
  | "notifSystemMessage"
  // Authentication & backend states (Supabase integration, Phase 1)
  | "signingIn"
  | "creatingAccount"
  | "loadingAccount"
  | "invalidEmailOrPassword"
  | "accountAlreadyExists"
  | "networkError"
  | "unableToLoadProfile"
  | "unableToSaveChanges"
  | "unableToLoadAddresses"
  | "unableToAddAddress"
  | "unableToUpdateAddress"
  | "unableToDeleteAddress"
  | "retry"
  | "sessionExpired"
  | "emailVerificationRequired"
  | "backendNotConfigured"
  | "demoMode"
  | "somethingWentWrong"
  // Navigation header / section titles introduced by the header refresh
  | "laundryDetails"
  | "chooseYourService"
  | "currentStatus"
  | "needHelp"
  | "contactLaundry"
  | "callRider"
  | "reportAnIssue"
  | "faq"
  // Phase 2 — laundries & services backed by Supabase
  | "loadingLaundries"
  | "unableToLoadLaundries"
  | "noReviewsYet"
  | "noReviewsYetDescription";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    home: "Home",
    orders: "Orders",
    laundries: "Laundries",
    profile: "Profile",

    settings: "Settings",
    notifications: "Notifications",
    savedAddresses: "Saved Addresses",
    paymentMethods: "Payment Methods",
    favoriteLaundries: "Favorite Laundries",
    helpCenter: "Help Center",
    aboutWashGo: "About WashGo",
    logout: "Log Out",

    searchLaundries: "Search laundries",
    bookNow: "Book now",
    requestPickup: "Request Pickup",
    schedulePickup: "Schedule Pickup",
    chooseALaundry: "Choose a Laundry",
    chooseServices: "Choose Services",
    pickupDetails: "Pickup Details",
    orderSummary: "Order Summary",
    paymentMethod: "Payment Method",
    orderTracking: "Order Tracking",
    orderDetails: "Order Details",
    backToHome: "Back to Home",

    ordersSubtitle: "Track and manage your laundry orders.",
    active: "Active",
    history: "History",
    noActiveOrders: "No active orders",
    noActiveOrdersDescription: "Your ongoing laundry orders will appear here.",
    noOrderHistory: "No order history",
    noOrderHistoryDescription:
      "Your completed and cancelled orders will appear here.",
    bookLaundry: "Book Laundry",
    trackOrder: "Track Order",
    viewDetails: "View Details",
    estimatedArrival: "Estimated arrival",
    scheduledPickup: "Scheduled pickup",
    total: "Total",
    completed: "Completed",
    cancelled: "Cancelled",
    orderNotFound: "This order could not be found.",

    orderStepPlaced: "Order Placed",
    orderStepRiderAssigned: "Rider Assigned",
    orderStepPickedUp: "Picked Up",
    orderStepAtLaundryShop: "At Laundry Shop",
    orderStepWashing: "Washing",
    orderStepReadyForDelivery: "Ready for Delivery",
    orderStepOutForDelivery: "Out for Delivery",
    orderStepDelivered: "Delivered",

    account: "Account",
    support: "Support",
    editProfile: "Edit Profile",
    personalInformation: "Personal Information",
    preferences: "Preferences",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    system: "System",
    contactSupport: "Contact Support",
    termsAndPrivacy: "Terms and Privacy",
    saveChanges: "Save Changes",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    addAddress: "Add Address",
    editAddress: "Edit Address",
    deleteAddress: "Delete Address",
    setAsDefault: "Set as Default",
    default: "Default",
    cashOnDelivery: "Cash on Delivery",
    comingSoon: "Coming Soon",
    frequentlyAskedQuestions: "Frequently Asked Questions",
    contactSupportDetails:
      "Call +855 12 345 678 or email support@washgo.example (mock contact details).",
    changesSaved: "Changes saved",
    invalidEmail: "Invalid email",
    requiredField: "Required field",

    manageAppPreferences: "Manage app preferences.",
    theme: "Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    english: "English",
    khmer: "Khmer",
    pushNotifications: "Push Notifications",
    currency: "Currency",
    appVersion: "App Version",

    myOrders: "My Orders",
    regularMember: "Regular Member",
    logOutConfirmTitle: "Log Out",
    logOutConfirmMessage: "Are you sure you want to log out?",
    cancel: "Cancel",

    goodMorning: "Good morning",
    letUsHandleYourLaundry: "Let us handle your laundry today.",
    searchLaundriesOrServices: "Search laundries or services",
    categories: "Categories",
    nearbyLaundries: "Nearby Laundries",
    seeAll: "See all",
    popularServices: "Popular Services",
    noLaundriesFound: "No laundries found",
    noLaundriesFoundDescription:
      "Try searching for another laundry or service.",

    chooseOnMap: "Choose on Map",
    chooseLocation: "Choose Location",
    moveMapToSelectPickupPoint: "Move the map to select your pickup point.",
    selectedLocation: "Selected Location",
    confirmLocation: "Confirm Location",
    currentLocation: "Current Location",
    latitude: "Latitude",
    longitude: "Longitude",
    selectedCoordinates: "Coordinates",
    locationPermissionRequired: "Location Permission Required",
    locationPermissionMessage:
      "Please allow location access to use your current location, or move the map manually to select a pickup point.",
    unableToGetCurrentLocation:
      "Unable to get your current location. Please try again or move the map manually.",
    locatingYou: "Locating you…",
    mapUnavailable: "Interactive map unavailable",
    mapFallbackMessage:
      "The interactive map could not be loaded on this device. You can still confirm the default pickup point below.",

    all: "All",
    unread: "Unread",
    markAllAsRead: "Mark all as read",
    noNotifications: "No notifications",
    notificationsEmptyDescription:
      "Order updates and important messages will appear here.",
    youAreAllCaughtUp: "You're all caught up",
    noUnreadNotificationsDescription: "You have no unread notifications.",
    justNow: "Just now",
    minutesAgo: "{{count}} minutes ago",
    hoursAgo: "{{count}} hours ago",
    yesterday: "Yesterday",
    newNotification: "New notification",
    readNotification: "Read notification",

    notifOrderCreatedTitle: "Pickup requested",
    notifOrderCreatedMessage:
      "Your pickup request for order {{orderId}} has been received.",
    notifRiderAssignedTitle: "Rider assigned",
    notifRiderAssignedMessage:
      "{{riderName}} has been assigned to pick up your laundry.",
    notifPickupStartedTitle: "Pickup started",
    notifPickupStartedMessage:
      "{{riderName}} is on the way to collect your laundry.",
    notifPickedUpTitle: "Laundry picked up",
    notifPickedUpMessage: "Your laundry has arrived at {{laundryName}}.",
    notifWashingTitle: "Washing started",
    notifWashingMessage: "{{laundryName}} has started washing your items.",
    notifReadyTitle: "Ready for delivery",
    notifReadyMessage: "Your order is ready and waiting for delivery.",
    notifOutForDeliveryTitle: "Out for delivery",
    notifOutForDeliveryMessage:
      "Your rider is on the way and should arrive around {{eta}}.",
    notifDeliveredTitle: "Order delivered",
    notifDeliveredMessage: "Your order has been delivered successfully.",
    notifPromotionTitle: "Promotion",
    notifPromotionMessage:
      "Enjoy {{percent}}% off your next pickup — book now before it ends.",
    notifSystemTitle: "Account update",
    notifSystemMessage: "Your profile and preferences are up to date.",

    signingIn: "Signing in…",
    creatingAccount: "Creating account…",
    loadingAccount: "Loading account…",
    invalidEmailOrPassword: "Invalid email or password.",
    accountAlreadyExists: "An account with this email already exists.",
    networkError: "Network error. Please check your connection and try again.",
    unableToLoadProfile: "Unable to load your profile.",
    unableToSaveChanges: "Unable to save changes.",
    unableToLoadAddresses: "Unable to load addresses.",
    unableToAddAddress: "Unable to add address.",
    unableToUpdateAddress: "Unable to update address.",
    unableToDeleteAddress: "Unable to delete address.",
    retry: "Retry",
    sessionExpired: "Your session has expired. Please log in again.",
    emailVerificationRequired: "Please verify your email to continue.",
    backendNotConfigured: "Backend is not configured yet.",
    demoMode: "Demo mode — no real account required.",
    somethingWentWrong: "Something went wrong. Please try again.",

    laundryDetails: "Laundry Details",
    chooseYourService: "Choose your service",
    currentStatus: "Current Status",
    needHelp: "Need Help",
    contactLaundry: "Contact Laundry",
    callRider: "Call Rider",
    reportAnIssue: "Report an Issue",
    faq: "FAQ",

    loadingLaundries: "Loading laundries…",
    unableToLoadLaundries: "Unable to load laundries.",
    noReviewsYet: "No reviews yet",
    noReviewsYetDescription: "Be the first to review this laundry after your order.",
  },
  km: {
    home: "ទំព័រដើម",
    orders: "ការបញ្ជាទិញ",
    laundries: "ហាងបោកគក់",
    profile: "គណនី",

    settings: "ការកំណត់",
    notifications: "ការជូនដំណឹង",
    savedAddresses: "អាសយដ្ឋានដែលបានរក្សាទុក",
    paymentMethods: "វិធីបង់ប្រាក់",
    favoriteLaundries: "ហាងបោកគក់សំណព្វ",
    helpCenter: "មជ្ឈមណ្ឌលជំនួយ",
    aboutWashGo: "អំពី WashGo",
    logout: "ចាកចេញ",

    searchLaundries: "ស្វែងរកហាងបោកគក់",
    bookNow: "កម្មង់ឥឡូវនេះ",
    requestPickup: "ស្នើសុំមកយក",
    schedulePickup: "កំណត់ពេលមកយក",
    chooseALaundry: "ជ្រើសរើសហាងបោកគក់",
    chooseServices: "ជ្រើសរើសសេវាកម្ម",
    pickupDetails: "ព័ត៌មានលម្អិតការមកយក",
    orderSummary: "សេចក្តីសង្ខេបការបញ្ជាទិញ",
    paymentMethod: "វិធីបង់ប្រាក់",
    orderTracking: "តាមដានការបញ្ជាទិញ",
    orderDetails: "ព័ត៌មានលម្អិតការបញ្ជាទិញ",
    backToHome: "ត្រឡប់ទៅទំព័រដើម",

    ordersSubtitle: "តាមដាន និងគ្រប់គ្រងការបញ្ជាទិញបោកគក់របស់អ្នក។",
    active: "កំពុងដំណើរការ",
    history: "ប្រវត្តិ",
    noActiveOrders: "មិនមានការបញ្ជាទិញកំពុងដំណើរការទេ",
    noActiveOrdersDescription:
      "ការបញ្ជាទិញបោកគក់ដែលកំពុងដំណើរការរបស់អ្នកនឹងបង្ហាញនៅទីនេះ។",
    noOrderHistory: "មិនមានប្រវត្តិការបញ្ជាទិញទេ",
    noOrderHistoryDescription:
      "ការបញ្ជាទិញដែលបានបញ្ចប់ និងបានលុបចោលរបស់អ្នកនឹងបង្ហាញនៅទីនេះ។",
    bookLaundry: "កម្មង់ហាងបោកគក់",
    trackOrder: "តាមដានការបញ្ជាទិញ",
    viewDetails: "មើលព័ត៌មានលម្អិត",
    estimatedArrival: "ពេលវេលាមកដល់ប៉ាន់ស្មាន",
    scheduledPickup: "ពេលវេលាមកយកដែលបានកំណត់",
    total: "សរុប",
    completed: "បានបញ្ចប់",
    cancelled: "បានលុបចោល",
    orderNotFound: "រកមិនឃើញការបញ្ជាទិញនេះទេ។",

    orderStepPlaced: "បានធ្វើការបញ្ជាទិញ",
    orderStepRiderAssigned: "បានចាត់តាំងអ្នកបើកបរ",
    orderStepPickedUp: "បានមកយក",
    orderStepAtLaundryShop: "នៅហាងបោកគក់",
    orderStepWashing: "កំពុងបោក",
    orderStepReadyForDelivery: "ត្រៀមរួចសម្រាប់ដឹកជញ្ជូន",
    orderStepOutForDelivery: "កំពុងដឹកជញ្ជូន",
    orderStepDelivered: "បានដឹកជញ្ជូនរួច",

    account: "គណនី",
    support: "ជំនួយ",
    editProfile: "កែសម្រួលគណនី",
    personalInformation: "ព័ត៌មានផ្ទាល់ខ្លួន",
    preferences: "ចំណូលចិត្ត",
    appearance: "រូបរាង",
    light: "ភ្លឺ",
    dark: "ងងឹត",
    system: "តាមប្រព័ន្ធ",
    contactSupport: "ទាក់ទងផ្នែកជំនួយ",
    termsAndPrivacy: "លក្ខខណ្ឌ និងឯកជនភាព",
    saveChanges: "រក្សាទុកការផ្លាស់ប្តូរ",
    fullName: "ឈ្មោះពេញ",
    phoneNumber: "លេខទូរស័ព្ទ",
    emailAddress: "អាសយដ្ឋានអ៊ីមែល",
    addAddress: "បន្ថែមអាសយដ្ឋាន",
    editAddress: "កែសម្រួលអាសយដ្ឋាន",
    deleteAddress: "លុបអាសយដ្ឋាន",
    setAsDefault: "កំណត់ជាលំនាំដើម",
    default: "លំនាំដើម",
    cashOnDelivery: "បង់ប្រាក់ពេលដឹកជញ្ជូន",
    comingSoon: "នឹងមកដល់ឆាប់ៗនេះ",
    frequentlyAskedQuestions: "សំណួរដែលសួរញឹកញាប់",
    contactSupportDetails:
      "ទូរស័ព្ទមកលេខ +855 12 345 678 ឬផ្ញើអ៊ីមែលមកកាន់ support@washgo.example (ព័ត៌មានទំនាក់ទំនងសាកល្បង)។",
    changesSaved: "បានរក្សាទុកការផ្លាស់ប្តូរ",
    invalidEmail: "អ៊ីមែលមិនត្រឹមត្រូវ",
    requiredField: "ត្រូវការបំពេញប្រអប់នេះ",

    manageAppPreferences: "គ្រប់គ្រងការកំណត់កម្មវិធី។",
    theme: "រូបរាង",
    lightMode: "របៀបភ្លឺ",
    darkMode: "របៀបងងឹត",
    language: "ភាសា",
    english: "អង់គ្លេស",
    khmer: "ខ្មែរ",
    pushNotifications: "ការជូនដំណឹងតាមទូរស័ព្ទ",
    currency: "រូបិយប័ណ្ណ",
    appVersion: "កំណែកម្មវិធី",

    myOrders: "ការបញ្ជាទិញរបស់ខ្ញុំ",
    regularMember: "សមាជិកទូទៅ",
    logOutConfirmTitle: "ចាកចេញ",
    logOutConfirmMessage: "តើអ្នកប្រាកដជាចង់ចាកចេញឬ?",
    cancel: "បោះបង់",

    goodMorning: "អរុណសួស្តី",
    letUsHandleYourLaundry: "ទុកឱ្យយើងខ្ញុំមើលការបោកគក់របស់អ្នកថ្ងៃនេះ។",
    searchLaundriesOrServices: "ស្វែងរកហាងបោកគក់ ឬសេវាកម្ម",
    categories: "ប្រភេទ",
    nearbyLaundries: "ហាងបោកគក់នៅជិត",
    seeAll: "មើលទាំងអស់",
    popularServices: "សេវាកម្មពេញនិយម",
    noLaundriesFound: "រកមិនឃើញហាងបោកគក់ទេ",
    noLaundriesFoundDescription:
      "សូមសាកល្បងស្វែងរកហាងបោកគក់ ឬសេវាកម្មផ្សេងទៀត។",

    chooseOnMap: "ជ្រើសរើសលើផែនទី",
    chooseLocation: "ជ្រើសរើសទីតាំង",
    moveMapToSelectPickupPoint:
      "ផ្លាស់ទីផែនទីដើម្បីជ្រើសរើសទីតាំងមកយករបស់អ្នក។",
    selectedLocation: "ទីតាំងដែលបានជ្រើសរើស",
    confirmLocation: "បញ្ជាក់ទីតាំង",
    currentLocation: "ទីតាំងបច្ចុប្បន្ន",
    latitude: "រយៈទទឹង",
    longitude: "រយៈបណ្តោយ",
    selectedCoordinates: "កូអរដោនេ",
    locationPermissionRequired: "ត្រូវការសិទ្ធិចូលប្រើទីតាំង",
    locationPermissionMessage:
      "សូមអនុញ្ញាតការចូលប្រើទីតាំង ដើម្បីប្រើទីតាំងបច្ចុប្បន្នរបស់អ្នក ឬផ្លាស់ទីផែនទីដោយដៃដើម្បីជ្រើសរើសទីតាំងមកយក។",
    unableToGetCurrentLocation:
      "មិនអាចទទួលបានទីតាំងបច្ចុប្បន្នរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត ឬផ្លាស់ទីផែនទីដោយដៃ។",
    locatingYou: "កំពុងកំណត់ទីតាំងរបស់អ្នក…",
    mapUnavailable: "ផែនទីអន្តរកម្មមិនអាចប្រើបានទេ",
    mapFallbackMessage:
      "ផែនទីអន្តរកម្មមិនអាចផ្ទុកបានលើឧបករណ៍នេះទេ។ អ្នកនៅតែអាចបញ្ជាក់ទីតាំងមកយកលំនាំដើមខាងក្រោម។",

    all: "ទាំងអស់",
    unread: "មិនទាន់អាន",
    markAllAsRead: "សម្គាល់ថាបានអានទាំងអស់",
    noNotifications: "មិនមានការជូនដំណឹងទេ",
    notificationsEmptyDescription:
      "ព័ត៌មានអំពីការបញ្ជាទិញ និងសារសំខាន់ៗនឹងបង្ហាញនៅទីនេះ។",
    youAreAllCaughtUp: "អ្នកបានអានគ្រប់យ៉ាងហើយ",
    noUnreadNotificationsDescription: "អ្នកមិនមានការជូនដំណឹងដែលមិនទាន់អានទេ។",
    justNow: "ទើបតែឥឡូវនេះ",
    minutesAgo: "មុន {{count}} នាទី",
    hoursAgo: "មុន {{count}} ម៉ោង",
    yesterday: "ម្សិលមិញ",
    newNotification: "ការជូនដំណឹងថ្មី",
    readNotification: "ការជូនដំណឹងដែលបានអាន",

    notifOrderCreatedTitle: "បានស្នើសុំមកយក",
    notifOrderCreatedMessage:
      "សំណើមកយកសម្រាប់ការបញ្ជាទិញ {{orderId}} ត្រូវបានទទួល។",
    notifRiderAssignedTitle: "បានចាត់តាំងអ្នកបើកបរ",
    notifRiderAssignedMessage:
      "{{riderName}} ត្រូវបានចាត់តាំងឱ្យមកយកសម្លៀកបំពាក់របស់អ្នក។",
    notifPickupStartedTitle: "ចាប់ផ្តើមមកយក",
    notifPickupStartedMessage:
      "{{riderName}} កំពុងធ្វើដំណើរមកយកសម្លៀកបំពាក់របស់អ្នក។",
    notifPickedUpTitle: "បានមកយកសម្លៀកបំពាក់",
    notifPickedUpMessage: "សម្លៀកបំពាក់របស់អ្នកបានមកដល់ {{laundryName}} ។",
    notifWashingTitle: "ចាប់ផ្តើមបោក",
    notifWashingMessage: "{{laundryName}} បានចាប់ផ្តើមបោកសម្លៀកបំពាក់របស់អ្នក។",
    notifReadyTitle: "ត្រៀមរួចសម្រាប់ដឹកជញ្ជូន",
    notifReadyMessage: "ការបញ្ជាទិញរបស់អ្នករួចរាល់ ហើយកំពុងរង់ចាំដឹកជញ្ជូន។",
    notifOutForDeliveryTitle: "កំពុងដឹកជញ្ជូន",
    notifOutForDeliveryMessage:
      "អ្នកបើកបររបស់អ្នកកំពុងធ្វើដំណើរ ហើយនឹងមកដល់ប្រហែល {{eta}} ។",
    notifDeliveredTitle: "បានដឹកជញ្ជូនរួច",
    notifDeliveredMessage: "ការបញ្ជាទិញរបស់អ្នកត្រូវបានដឹកជញ្ជូនដោយជោគជ័យ។",
    notifPromotionTitle: "ការផ្តល់ជូន",
    notifPromotionMessage:
      "ទទួលបានការបញ្ចុះតម្លៃ {{percent}}% សម្រាប់ការមកយកលើកក្រោយ — កម្មង់ឥឡូវនេះមុនផុតកំណត់។",
    notifSystemTitle: "បច្ចុប្បន្នភាពគណនី",
    notifSystemMessage: "ព័ត៌មានគណនី និងចំណូលចិត្តរបស់អ្នកទាន់សម័យហើយ។",

    signingIn: "កំពុងចូលគណនី…",
    creatingAccount: "កំពុងបង្កើតគណនី…",
    loadingAccount: "កំពុងផ្ទុកគណនី…",
    invalidEmailOrPassword: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។",
    accountAlreadyExists: "មានគណនីប្រើអ៊ីមែលនេះរួចហើយ។",
    networkError:
      "មានបញ្ហាបណ្តាញ។ សូមពិនិត្យការតភ្ជាប់របស់អ្នក ហើយព្យាយាមម្តងទៀត។",
    unableToLoadProfile: "មិនអាចផ្ទុកគណនីរបស់អ្នកបានទេ។",
    unableToSaveChanges: "មិនអាចរក្សាទុកការផ្លាស់ប្តូរបានទេ។",
    unableToLoadAddresses: "មិនអាចផ្ទុកអាសយដ្ឋានបានទេ។",
    unableToAddAddress: "មិនអាចបន្ថែមអាសយដ្ឋានបានទេ។",
    unableToUpdateAddress: "មិនអាចធ្វើបច្ចុប្បន្នភាពអាសយដ្ឋានបានទេ។",
    unableToDeleteAddress: "មិនអាចលុបអាសយដ្ឋានបានទេ។",
    retry: "ព្យាយាមម្តងទៀត",
    sessionExpired: "សម័យចូលប្រើរបស់អ្នកបានផុតកំណត់។ សូមចូលគណនីម្តងទៀត។",
    emailVerificationRequired: "សូមផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នកដើម្បីបន្ត។",
    backendNotConfigured: "ប្រព័ន្ធខាងក្រោយមិនទាន់បានកំណត់រចនាសម្ព័ន្ធនៅឡើយទេ។",
    demoMode: "របៀបសាកល្បង — មិនចាំបាច់មានគណនីពិតទេ។",
    somethingWentWrong: "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។",

    laundryDetails: "ព័ត៌មានលម្អិតហាងបោកគក់",
    chooseYourService: "ជ្រើសរើសសេវាកម្មរបស់អ្នក",
    currentStatus: "ស្ថានភាពបច្ចុប្បន្ន",
    needHelp: "ត្រូវការជំនួយ",
    contactLaundry: "ទាក់ទងហាងបោកគក់",
    callRider: "ហៅអ្នកបើកបរ",
    reportAnIssue: "រាយការណ៍ពីបញ្ហា",
    faq: "សំណួរញឹកញាប់",

    loadingLaundries: "កំពុងផ្ទុកហាងបោកគក់…",
    unableToLoadLaundries: "មិនអាចផ្ទុកហាងបោកគក់បានទេ។",
    noReviewsYet: "មិនទាន់មានការវាយតម្លៃនៅឡើយទេ",
    noReviewsYetDescription: "សូមក្លាយជាអ្នកដំបូងវាយតម្លៃហាងបោកគក់នេះបន្ទាប់ពីការកម្មង់របស់អ្នក។",
  },
};
