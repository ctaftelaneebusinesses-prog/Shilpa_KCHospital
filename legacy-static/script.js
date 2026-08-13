/* =========================================
   DR SHILPA WEBSITE
   KC HOSPITAL - KUPPAM
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const WHATSAPP_NUMBER = "918090905900";


/* =========================================
   MOBILE MENU
========================================= */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {

  mobileMenu.classList.toggle("show");

});


document.querySelectorAll(".mobile-menu a").forEach(link => {

  link.addEventListener("click", () => {
    mobileMenu.classList.remove("show");
  });

});


/* =========================================
   LANGUAGE SYSTEM
========================================= */

const translations = {

  en: {

    navHome: "Home",
    navAbout: "About",
    navServices: "Services",
    navAppointment: "Appointment",
    navContact: "Contact",

    bookNow: "Book Appointment",

    available: "Appointments Available",

    specialist: "WOMEN'S HEALTH SPECIALIST",

    heroDescription:
      "Compassionate and personalized gynaecological care for women of every age.",

    bookAppointment: "Book Appointment",

    callNow: "Call Now",

    languages: "Languages",
    support: "Patient Support",
    care: "Personal Care",

    specialistBadge: "Women's Health",
    specialistCare: "Specialist Care",

    doctor: "Dr. Shilpa",
    gynaecologist: "Gynaecologist",

    personalized: "Personalized",
    attention: "Patient Attention",

    aboutDoctor: "ABOUT DR. SHILPA",

    aboutTitle:
      "A trusted approach to women's healthcare.",

    aboutText:
      "Dr. Shilpa provides patient-focused gynaecological care with an emphasis on comfort, privacy, clear communication and personalized treatment.",

    pointOne:
      "Comfortable and confidential consultations",

    pointTwo:
      "Personalized treatment guidance",

    pointThree:
      "Women's health and pregnancy care",

    womenFirst: "Women First",
    careApproach: "Care with compassion",

    servicesLabel: "WOMEN'S HEALTHCARE",

    servicesTitle:
      "Care designed around you.",

    servicesDescription:
      "Professional care for different stages and needs of women's health.",

    service1Title: "Women's Health",
    service1Text:
      "Routine consultations, health concerns and preventive care.",

    service2Title: "Pregnancy Care",
    service2Text:
      "Support and guidance throughout pregnancy.",

    service3Title: "PCOS & Hormonal Health",
    service3Text:
      "Consultation and guidance for hormonal and menstrual concerns.",

    service4Title: "Gynaecological Care",
    service4Text:
      "Confidential consultations for gynaecological concerns.",

    service5Title: "Menstrual Health",
    service5Text:
      "Guidance for irregular periods and menstrual health.",

    service6Title: "Family Planning",
    service6Text:
      "Personalized family planning consultations.",

    appointmentLabel: "APPOINTMENT",

    appointmentTitle:
      "Your health deserves time and attention.",

    appointmentText:
      "Request your appointment and our team will contact you to confirm the available time.",

    benefit1: "Easy appointment request",
    benefit2: "WhatsApp confirmation",
    benefit3: "Multilingual assistance",
    benefit4: "Convenient patient support",

    formTitle: "Request an Appointment",

    formSubtitle:
      "Fill in your details below.",

    nameLabel: "Patient Name",
    phoneLabel: "Phone Number",
    cityLabel: "City",
    dateLabel: "Preferred Date",
    timeLabel: "Preferred Time",

    selectTime: "Select time",

    voiceTitle: "Speak your message",

    voiceSubtitle:
      "Tap the microphone and speak",

    sendWhatsApp:
      "Continue on WhatsApp",

    privacyText:
      "Your details are used only to help process your appointment request.",

    locationLabel: "VISIT KC HOSPITAL",

    locationTitle:
      "Conveniently located in Kuppam.",

    address:
      "Kamthmoor Road,<br>Kuppam, Andhra Pradesh",

    callHospital: "Call",

    openMaps:
      "Open in Google Maps →",

    call: "Call",
    book: "Book",

    successTitle:
      "Appointment Request Ready",

    successText:
      "WhatsApp will open with your appointment details."

  },


  te: {

    navHome: "హోమ్",
    navAbout: "మా గురించి",
    navServices: "సేవలు",
    navAppointment: "అపాయింట్మెంట్",
    navContact: "సంప్రదించండి",

    bookNow: "అపాయింట్మెంట్ బుక్ చేయండి",

    available: "అపాయింట్మెంట్లు అందుబాటులో ఉన్నాయి",

    specialist: "మహిళల ఆరోగ్య నిపుణులు",

    heroDescription:
      "ప్రతి వయస్సు మహిళలకు శ్రద్ధతో మరియు వ్యక్తిగతీకరించిన గైనకాలజీ సేవలు.",

    bookAppointment: "అపాయింట్మెంట్ బుక్ చేయండి",

    callNow: "కాల్ చేయండి",

    languages: "భాషలు",
    support: "రోగి సహాయం",
    care: "వ్యక్తిగత శ్రద్ధ",

    specialistBadge: "మహిళల ఆరోగ్యం",
    specialistCare: "నిపుణుల సేవలు",

    doctor: "డా. శిల్పా",
    gynaecologist: "గైనకాలజిస్ట్",

    personalized: "వ్యక్తిగత",
    attention: "రోగి శ్రద్ధ",

    aboutDoctor: "డా. శిల్పా గురించి",

    aboutTitle:
      "మహిళల ఆరోగ్యానికి నమ్మకమైన వైద్య సేవలు.",

    aboutText:
      "డా. శిల్పా మహిళల ఆరోగ్య సమస్యలకు గోప్యత, సౌకర్యం మరియు వ్యక్తిగత శ్రద్ధతో వైద్య సలహాలను అందిస్తున్నారు.",

    pointOne:
      "సౌకర్యవంతమైన మరియు గోప్యమైన సంప్రదింపులు",

    pointTwo:
      "వ్యక్తిగత చికిత్స మార్గదర్శకం",

    pointThree:
      "మహిళల ఆరోగ్యం మరియు గర్భధారణ సంరక్షణ",

    womenFirst: "మహిళలకు ప్రాధాన్యత",
    careApproach: "శ్రద్ధతో కూడిన సేవ",

    servicesLabel: "మహిళల ఆరోగ్య సేవలు",

    servicesTitle:
      "మీ కోసం రూపొందించిన వైద్య సేవలు.",

    servicesDescription:
      "మహిళల ఆరోగ్యానికి సంబంధించిన వివిధ దశల్లో నిపుణుల వైద్య సేవలు.",

    service1Title: "మహిళల ఆరోగ్యం",
    service1Text:
      "సాధారణ ఆరోగ్య పరీక్షలు మరియు మహిళల ఆరోగ్య సలహాలు.",

    service2Title: "గర్భధారణ సంరక్షణ",
    service2Text:
      "గర్భధారణ సమయంలో అవసరమైన మార్గదర్శకత్వం.",

    service3Title: "PCOS & హార్మోనల్ ఆరోగ్యం",
    service3Text:
      "హార్మోన్లు మరియు నెలసరి సమస్యలకు సలహాలు.",

    service4Title: "గైనకాలజీ సేవలు",
    service4Text:
      "గోప్యమైన గైనకాలజీ సంప్రదింపులు.",

    service5Title: "నెలసరి ఆరోగ్యం",
    service5Text:
      "నెలసరి సమస్యలకు మరియు అసమాన పీరియడ్స్‌కు మార్గదర్శకం.",

    service6Title: "కుటుంబ నియంత్రణ",
    service6Text:
      "వ్యక్తిగత కుటుంబ నియంత్రణ సలహాలు.",

    appointmentLabel: "అపాయింట్మెంట్",

    appointmentTitle:
      "మీ ఆరోగ్యానికి సమయం మరియు శ్రద్ధ అవసరం.",

    appointmentText:
      "మీ వివరాలను పంపండి. అందుబాటులో ఉన్న సమయాన్ని మా బృందం నిర్ధారిస్తుంది.",

    benefit1: "సులభమైన అపాయింట్మెంట్",
    benefit2: "WhatsApp నిర్ధారణ",
    benefit3: "బహుభాషా సహాయం",
    benefit4: "రోగులకు సులభమైన సహాయం",

    formTitle: "అపాయింట్మెంట్ కోరండి",

    formSubtitle:
      "క్రింద మీ వివరాలను నమోదు చేయండి.",

    nameLabel: "రోగి పేరు",
    phoneLabel: "ఫోన్ నంబర్",
    cityLabel: "నగరం",
    dateLabel: "కావలసిన తేదీ",
    timeLabel: "కావలసిన సమయం",

    selectTime: "సమయాన్ని ఎంచుకోండి",

    voiceTitle: "మీ సందేశాన్ని మాట్లాడండి",

    voiceSubtitle:
      "మైక్రోఫోన్ నొక్కి మాట్లాడండి",

    sendWhatsApp:
      "WhatsApp ద్వారా కొనసాగించండి",

    privacyText:
      "మీ వివరాలు అపాయింట్మెంట్ కోసం మాత్రమే ఉపయోగించబడతాయి.",

    locationLabel: "KC హాస్పిటల్‌ను సందర్శించండి",

    locationTitle:
      "కుప్పంలో సౌకర్యవంతమైన ప్రదేశంలో.",

    address:
      "కమత్మూర్ రోడ్,<br>కుప్పం, ఆంధ్రప్రదేశ్",

    callHospital: "కాల్",

    openMaps:
      "Google Mapsలో తెరవండి →",

    call: "కాల్",
    book: "బుక్",

    successTitle:
      "అపాయింట్మెంట్ సిద్ధంగా ఉంది",

    successText:
      "మీ అపాయింట్మెంట్ వివరాలతో WhatsApp తెరవబడుతుంది."

  },


  ta: {

    navHome: "முகப்பு",
    navAbout: "எங்களை பற்றி",
    navServices: "சேவைகள்",
    navAppointment: "முன்பதிவு",
    navContact: "தொடர்பு",

    bookNow: "முன்பதிவு செய்யுங்கள்",

    available: "முன்பதிவுகள் உள்ளன",

    specialist: "பெண்கள் நல நிபுணர்",

    heroDescription:
      "அனைத்து வயது பெண்களுக்கும் அன்பான மற்றும் தனிப்பட்ட மகப்பேறு மருத்துவ சேவை.",

    bookAppointment: "முன்பதிவு செய்யுங்கள்",

    callNow: "அழைக்கவும்",

    languages: "மொழிகள்",
    support: "நோயாளர் உதவி",
    care: "தனிப்பட்ட கவனம்",

    specialistBadge: "பெண்கள் நலம்",
    specialistCare: "சிறப்பு சேவை",

    doctor: "டாக்டர் ஷில்பா",
    gynaecologist: "மகப்பேறு மருத்துவர்",

    personalized: "தனிப்பட்ட",
    attention: "நோயாளர் கவனம்",

    aboutDoctor: "டாக்டர் ஷில்பா பற்றி",

    aboutTitle:
      "பெண்கள் நலத்திற்கு நம்பகமான மருத்துவ சேவை.",

    aboutText:
      "டாக்டர் ஷில்பா பெண்களின் உடல்நலத்திற்கு தனியுரிமை, வசதி மற்றும் தனிப்பட்ட கவனத்துடன் மருத்துவ ஆலோசனை வழங்குகிறார்.",

    pointOne:
      "வசதியான மற்றும் ரகசிய ஆலோசனை",

    pointTwo:
      "தனிப்பட்ட சிகிச்சை வழிகாட்டுதல்",

    pointThree:
      "பெண்கள் நலம் மற்றும் கர்ப்பகால பராமரிப்பு",

    womenFirst: "பெண்களுக்கு முன்னுரிமை",
    careApproach: "அன்பான பராமரிப்பு",

    servicesLabel: "பெண்கள் நல சேவைகள்",

    servicesTitle:
      "உங்களுக்காக வடிவமைக்கப்பட்ட சேவை.",

    servicesDescription:
      "பெண்களின் பல்வேறு உடல்நல தேவைகளுக்கான மருத்துவ சேவைகள்.",

    service1Title: "பெண்கள் நலம்",
    service1Text:
      "பெண்களின் பொதுவான உடல்நல ஆலோசனைகள்.",

    service2Title: "கர்ப்பகால பராமரிப்பு",
    service2Text:
      "கர்ப்ப காலத்தில் தேவையான வழிகாட்டுதல்.",

    service3Title: "PCOS & ஹார்மோன் நலம்",
    service3Text:
      "ஹார்மோன் மற்றும் மாதவிடாய் தொடர்பான ஆலோசனை.",

    service4Title: "மகப்பேறு மருத்துவம்",
    service4Text:
      "ரகசியமான மகப்பேறு மருத்துவ ஆலோசனை.",

    service5Title: "மாதவிடாய் நலம்",
    service5Text:
      "மாதவிடாய் பிரச்சினைகளுக்கான வழிகாட்டுதல்.",

    service6Title: "குடும்ப திட்டமிடல்",
    service6Text:
      "தனிப்பட்ட குடும்ப திட்டமிடல் ஆலோசனை.",

    appointmentLabel: "முன்பதிவு",

    appointmentTitle:
      "உங்கள் உடல்நலத்திற்கு நேரமும் கவனமும் தேவை.",

    appointmentText:
      "உங்கள் விவரங்களை அனுப்புங்கள். கிடைக்கும் நேரத்தை எங்கள் குழு உறுதி செய்யும்.",

    benefit1: "எளிய முன்பதிவு",
    benefit2: "WhatsApp உறுதிப்படுத்தல்",
    benefit3: "பல மொழி உதவி",
    benefit4: "நோயாளர் உதவி",

    formTitle: "முன்பதிவு கோரிக்கை",

    formSubtitle:
      "கீழே உங்கள் விவரங்களை உள்ளிடுங்கள்.",

    nameLabel: "நோயாளர் பெயர்",
    phoneLabel: "தொலைபேசி எண்",
    cityLabel: "நகரம்",
    dateLabel: "விருப்ப தேதி",
    timeLabel: "விருப்ப நேரம்",

    selectTime: "நேரத்தை தேர்ந்தெடுக்கவும்",

    voiceTitle: "உங்கள் செய்தியை பேசுங்கள்",

    voiceSubtitle:
      "மைக்ரோஃபோனை அழுத்தி பேசுங்கள்",

    sendWhatsApp:
      "WhatsApp மூலம் தொடரவும்",

    privacyText:
      "உங்கள் விவரங்கள் முன்பதிவு செயல்முறைக்காக மட்டுமே பயன்படுத்தப்படும்.",

    locationLabel: "KC மருத்துவமனைக்கு வாருங்கள்",

    locationTitle:
      "குப்பத்தில் வசதியான இடம்.",

    address:
      "கமத்மூர் சாலை,<br>குப்பம், ஆந்திரப் பிரதேசம்",

    callHospital: "அழைக்கவும்",

    openMaps:
      "Google Mapsல் திறக்கவும் →",

    call: "அழை",
    book: "முன்பதிவு",

    successTitle:
      "முன்பதிவு கோரிக்கை தயார்",

    successText:
      "உங்கள் முன்பதிவு விவரங்களுடன் WhatsApp திறக்கப்படும்."

  },


  kn: {

    navHome: "ಮುಖಪುಟ",
    navAbout: "ನಮ್ಮ ಬಗ್ಗೆ",
    navServices: "ಸೇವೆಗಳು",
    navAppointment: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್",
    navContact: "ಸಂಪರ್ಕಿಸಿ",

    bookNow: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",

    available: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಲಭ್ಯವಿದೆ",

    specialist: "ಮಹಿಳಾ ಆರೋಗ್ಯ ತಜ್ಞರು",

    heroDescription:
      "ಎಲ್ಲಾ ವಯಸ್ಸಿನ ಮಹಿಳೆಯರಿಗೆ ಕಾಳಜಿಯುತ ಮತ್ತು ವೈಯಕ್ತಿಕ ಸ್ತ್ರೀರೋಗ ವೈದ್ಯಕೀಯ ಸೇವೆ.",

    bookAppointment: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",

    callNow: "ಈಗ ಕರೆ ಮಾಡಿ",

    languages: "ಭಾಷೆಗಳು",
    support: "ರೋಗಿ ಸಹಾಯ",
    care: "ವೈಯಕ್ತಿಕ ಕಾಳಜಿ",

    specialistBadge: "ಮಹಿಳಾ ಆರೋಗ್ಯ",
    specialistCare: "ತಜ್ಞರ ಸೇವೆ",

    doctor: "ಡಾ. ಶಿಲ್ಪಾ",
    gynaecologist: "ಸ್ತ್ರೀರೋಗ ತಜ್ಞರು",

    personalized: "ವೈಯಕ್ತಿಕ",
    attention: "ರೋಗಿ ಕಾಳಜಿ",

    aboutDoctor: "ಡಾ. ಶಿಲ್ಪಾ ಬಗ್ಗೆ",

    aboutTitle:
      "ಮಹಿಳಾ ಆರೋಗ್ಯಕ್ಕೆ ನಂಬಿಕೆಯ ವೈದ್ಯಕೀಯ ಸೇವೆ.",

    aboutText:
      "ಡಾ. ಶಿಲ್ಪಾ ಮಹಿಳೆಯರ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳಿಗೆ ಗೌಪ್ಯತೆ, ಆರಾಮ ಮತ್ತು ವೈಯಕ್ತಿಕ ಕಾಳಜಿಯೊಂದಿಗೆ ವೈದ್ಯಕೀಯ ಸಲಹೆ ನೀಡುತ್ತಾರೆ.",

    pointOne:
      "ಆರಾಮದಾಯಕ ಮತ್ತು ಗೌಪ್ಯ ಸಮಾಲೋಚನೆ",

    pointTwo:
      "ವೈಯಕ್ತಿಕ ಚಿಕಿತ್ಸಾ ಮಾರ್ಗದರ್ಶನ",

    pointThree:
      "ಮಹಿಳಾ ಆರೋಗ್ಯ ಮತ್ತು ಗರ್ಭಧಾರಣೆಯ ಆರೈಕೆ",

    womenFirst: "ಮಹಿಳೆಯರಿಗೆ ಮೊದಲ ಆದ್ಯತೆ",
    careApproach: "ಕಾಳಜಿಯೊಂದಿಗೆ ಸೇವೆ",

    servicesLabel: "ಮಹಿಳಾ ಆರೋಗ್ಯ ಸೇವೆಗಳು",

    servicesTitle:
      "ನಿಮಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಿದ ಆರೈಕೆ.",

    servicesDescription:
      "ಮಹಿಳೆಯರ ವಿವಿಧ ಆರೋಗ್ಯ ಅಗತ್ಯಗಳಿಗೆ ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಸೇವೆಗಳು.",

    service1Title: "ಮಹಿಳಾ ಆರೋಗ್ಯ",
    service1Text:
      "ಮಹಿಳೆಯರ ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಸಲಹೆ ಮತ್ತು ತಪಾಸಣೆ.",

    service2Title: "ಗರ್ಭಧಾರಣೆ ಆರೈಕೆ",
    service2Text:
      "ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಅಗತ್ಯ ಮಾರ್ಗದರ್ಶನ.",

    service3Title: "PCOS & ಹಾರ್ಮೋನ್ ಆರೋಗ್ಯ",
    service3Text:
      "ಹಾರ್ಮೋನ್ ಮತ್ತು ಮಾಸಿಕ ಸಮಸ್ಯೆಗಳ ಸಲಹೆ.",

    service4Title: "ಸ್ತ್ರೀರೋಗ ಆರೈಕೆ",
    service4Text:
      "ಗೌಪ್ಯ ಸ್ತ್ರೀರೋಗ ವೈದ್ಯಕೀಯ ಸಮಾಲೋಚನೆ.",

    service5Title: "ಮಾಸಿಕ ಆರೋಗ್ಯ",
    service5Text:
      "ಅನಿಯಮಿತ ಮಾಸಿಕ ಮತ್ತು ಸಂಬಂಧಿತ ಸಮಸ್ಯೆಗಳ ಮಾರ್ಗದರ್ಶನ.",

    service6Title: "ಕುಟುಂಬ ಯೋಜನೆ",
    service6Text:
      "ವೈಯಕ್ತಿಕ ಕುಟುಂಬ ಯೋಜನೆ ಸಮಾಲೋಚನೆ.",

    appointmentLabel: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್",

    appointmentTitle:
      "ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕೆ ಸಮಯ ಮತ್ತು ಕಾಳಜಿ ಅಗತ್ಯ.",

    appointmentText:
      "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಕಳುಹಿಸಿ. ಲಭ್ಯವಿರುವ ಸಮಯವನ್ನು ನಮ್ಮ ತಂಡ ಖಚಿತಪಡಿಸುತ್ತದೆ.",

    benefit1: "ಸುಲಭ ಅಪಾಯಿಂಟ್ಮೆಂಟ್",
    benefit2: "WhatsApp ದೃಢೀಕರಣ",
    benefit3: "ಬಹುಭಾಷಾ ಸಹಾಯ",
    benefit4: "ರೋಗಿ ಸಹಾಯ",

    formTitle: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ವಿನಂತಿ",

    formSubtitle:
      "ಕೆಳಗೆ ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",

    nameLabel: "ರೋಗಿಯ ಹೆಸರು",
    phoneLabel: "ಫೋನ್ ಸಂಖ್ಯೆ",
    cityLabel: "ನಗರ",
    dateLabel: "ಆದ್ಯತೆಯ ದಿನಾಂಕ",
    timeLabel: "ಆದ್ಯತೆಯ ಸಮಯ",

    selectTime: "ಸಮಯ ಆಯ್ಕೆಮಾಡಿ",

    voiceTitle: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಮಾತನಾಡಿ",

    voiceSubtitle:
      "ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ ಮಾತನಾಡಿ",

    sendWhatsApp:
      "WhatsApp ನಲ್ಲಿ ಮುಂದುವರಿಸಿ",

    privacyText:
      "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಪ್ರಕ್ರಿಯೆಗಾಗಿ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ.",

    locationLabel: "KC ಆಸ್ಪತ್ರೆಯನ್ನು ಭೇಟಿ ಮಾಡಿ",

    locationTitle:
      "ಕುಪ್ಪಂನಲ್ಲಿ ಅನುಕೂಲಕರ ಸ್ಥಳ.",

    address:
      "ಕಮತ್ಮೂರ್ ರಸ್ತೆ,<br>ಕುಪ್ಪಂ, ಆಂಧ್ರ ಪ್ರದೇಶ",

    callHospital: "ಕರೆ ಮಾಡಿ",

    openMaps:
      "Google Maps ನಲ್ಲಿ ತೆರೆಯಿರಿ →",

    call: "ಕರೆ",
    book: "ಬುಕ್",

    successTitle:
      "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ವಿನಂತಿ ಸಿದ್ಧವಾಗಿದೆ",

    successText:
      "ನಿಮ್ಮ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ವಿವರಗಳೊಂದಿಗೆ WhatsApp ತೆರೆಯುತ್ತದೆ."

  }

};


/* =========================================
   LANGUAGE CHANGE
========================================= */

const languageSelect = document.getElementById("languageSelect");

function changeLanguage(language) {

  const data = translations[language];

  if (!data) return;

  document.querySelectorAll("[data-i18n]").forEach(element => {

    const key = element.getAttribute("data-i18n");

    if (data[key]) {

      element.innerHTML = data[key];

    }

  });

  document.documentElement.lang = language;

  localStorage.setItem("drShilpaLanguage", language);

}


languageSelect.addEventListener("change", function () {

  changeLanguage(this.value);

});


const savedLanguage =
  localStorage.getItem("drShilpaLanguage") || "en";

languageSelect.value = savedLanguage;

changeLanguage(savedLanguage);


/* =========================================
   MINIMUM DATE
========================================= */

const dateInput =
  document.getElementById("appointmentDate");

const today =
  new Date().toISOString().split("T")[0];

dateInput.min = today;


/* =========================================
   APPOINTMENT FORM
========================================= */

const appointmentForm =
  document.getElementById("appointmentForm");

const successModal =
  document.getElementById("successModal");

const closeModal =
  document.getElementById("closeModal");


appointmentForm.addEventListener("submit", function(event) {

  event.preventDefault();


  const name =
    document.getElementById("patientName").value.trim();

  const phone =
    document.getElementById("patientPhone").value.trim();

  const city =
    document.getElementById("patientCity").value.trim();

  const date =
    document.getElementById("appointmentDate").value;

  const time =
    document.getElementById("appointmentTime").value;

  const voiceMessage =
    document.getElementById("voiceMessage").value.trim();


  if (!name || !phone || !city || !date || !time) {

    alert("Please fill all required fields.");

    return;

  }


  if (!/^[0-9]{10}$/.test(phone)) {

    alert("Please enter a valid 10-digit mobile number.");

    return;

  }


  const selectedLanguage =
    languageSelect.value;


  const languageNames = {

    en: "English",
    te: "Telugu",
    ta: "Tamil",
    kn: "Kannada"

  };


  const message =

`Hello Dr. Shilpa / KC Hospital,

I would like to request a gynaecology appointment.

Patient Name: ${name}
Phone Number: ${phone}
City: ${city}
Preferred Date: ${date}
Preferred Time: ${time}

Language Preference: ${languageNames[selectedLanguage]}

Additional Message:
${voiceMessage || "No additional message"}

Please confirm my appointment.

Thank you.`;


  const whatsappURL =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;


  successModal.classList.add("show");


  setTimeout(() => {

    window.open(whatsappURL, "_blank");

  }, 700);


});


/* =========================================
   MODAL
========================================= */

closeModal.addEventListener("click", () => {

  successModal.classList.remove("show");

});


successModal.addEventListener("click", event => {

  if (event.target === successModal) {

    successModal.classList.remove("show");

  }

});


/* =========================================
   VOICE INPUT
========================================= */

const voiceBtn =
  document.getElementById("voiceBtn");

const voiceMessage =
  document.getElementById("voiceMessage");

const voiceStatus =
  document.getElementById("voiceStatus");


const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;


if (SpeechRecognition) {

  const recognition =
    new SpeechRecognition();

  recognition.continuous = false;

  recognition.interimResults = false;


  function getSpeechLanguage() {

    const language =
      languageSelect.value;

    const languages = {

      en: "en-IN",
      te: "te-IN",
      ta: "ta-IN",
      kn: "kn-IN"

    };

    return languages[language] || "en-IN";

  }


  voiceBtn.addEventListener("click", () => {

    recognition.lang =
      getSpeechLanguage();

    recognition.start();

    voiceBtn.classList.add("listening");

    voiceStatus.textContent =
      "Listening... Speak now.";

  });


  recognition.onresult = event => {

    const transcript =
      event.results[0][0].transcript;

    voiceMessage.value +=
      (voiceMessage.value ? " " : "") +
      transcript;

  };


  recognition.onend = () => {

    voiceBtn.classList.remove("listening");

    voiceStatus.textContent =
      "Voice message captured.";

  };


  recognition.onerror = event => {

    voiceBtn.classList.remove("listening");

    voiceStatus.textContent =
      "Voice input unavailable. Please type your message.";

    console.log(event.error);

  };

} else {

  voiceBtn.disabled = true;

  voiceStatus.textContent =
    "Voice input is not supported in this browser.";

}


/* =========================================
   SCROLL REVEAL ANIMATION
========================================= */

const observer =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("active");

        }

      });

    },

    {
      threshold: 0.12
    }

  );


document.querySelectorAll(".reveal").forEach(element => {

  observer.observe(element);

});


/* =========================================
   HEADER SCROLL EFFECT
========================================= */

const header =
  document.getElementById("header");


window.addEventListener("scroll", () => {

  if (window.scrollY > 30) {

    header.style.boxShadow =
      "0 8px 30px rgba(60,40,50,.07)";

  } else {

    header.style.boxShadow = "none";

  }

});


/* =========================================
   SMOOTH INTERNAL LINKS
========================================= */

document.querySelectorAll('a[href^="#"]').forEach(link => {

  link.addEventListener("click", function(event) {

    const target =
      document.querySelector(this.getAttribute("href"));

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth"
    });

  });

});