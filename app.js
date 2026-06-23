// Import or declare the lucide variable before using it
const lucide = window.lucide || {} // Assuming lucide is available in the window object or needs to be imported

// User Events Store
class UserEventsStore {
  constructor() {
    this.eventsGoing = new Set(JSON.parse(localStorage.getItem("userEventsGoing") || "[]"))
    this.eventsDownToGo = new Set(JSON.parse(localStorage.getItem("userEventsDownToGo") || "[]"))
    this.listeners = []
  }

  saveToStorage() {
    localStorage.setItem("userEventsGoing", JSON.stringify([...this.eventsGoing]))
    localStorage.setItem("userEventsDownToGo", JSON.stringify([...this.eventsDownToGo]))
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  setEventGoing(eventId, isGoing) {
    if (isGoing) {
      this.eventsGoing.add(eventId)
      this.eventsDownToGo.delete(eventId)
    } else {
      this.eventsGoing.delete(eventId)
    }
    this.saveToStorage()
    this.notifyListeners()
  }

  setEventDownToGo(eventId, isDownToGo) {
    if (isDownToGo) {
      this.eventsDownToGo.add(eventId)
      this.eventsGoing.delete(eventId)
    } else {
      this.eventsDownToGo.delete(eventId)
    }
    this.saveToStorage()
    this.notifyListeners()
  }

  isEventGoing(eventId) {
    return this.eventsGoing.has(eventId)
  }

  isEventDownToGo(eventId) {
    return this.eventsDownToGo.has(eventId)
  }

  getGoingEvents() {
    return [...this.eventsGoing]
  }

  getDownToGoEvents() {
    return [...this.eventsDownToGo]
  }
}

const userEventsStore = new UserEventsStore()

// Router and App State
let currentPage = "social-feed"
let currentEventId = null
let currentUsername = null

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons()
  showPage("social-feed")
})

// Navigation
function showPage(page, params = {}) {
  currentPage = page
  currentEventId = params.eventId || null
  currentUsername = params.username || null

  // Update navigation active state
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("text-blue-600")
    item.classList.add("text-gray-600")
  })

  const activeNav = document.querySelector(`[data-page="${page}"]`)
  if (activeNav) {
    activeNav.classList.remove("text-gray-600")
    activeNav.classList.add("text-blue-600")
  }

  // Render page content
  const mainContent = document.getElementById("main-content")

  switch (page) {
    case "social-feed":
      mainContent.innerHTML = renderSocialFeed()
      break
    case "search":
      mainContent.innerHTML = renderEventSearch()
      setupSearchFilters()
      break
    case "profile":
      mainContent.innerHTML = renderProfile()
      setupProfileTabs()
      break
    case "event":
      mainContent.innerHTML = renderEventDetail(currentEventId)
      setupEventDetail()
      break
    case "user":
      mainContent.innerHTML = renderUserProfile(currentUsername)
      setupUserProfileTabs()
      break
    default:
      mainContent.innerHTML = renderSocialFeed()
  }

  lucide.createIcons()
}

// Social Feed
function renderSocialFeed() {
  return `
  <div class="mobile-container py-6">
    <h1 class="text-2xl font-bold mb-6">Social Feed</h1>
    <div class="event-spacing">
      ${window.posts.map((post) => renderSocialPost(post)).join("")}
    </div>
  </div>
`
}

function renderSocialPost(post) {
  const postText = post.isGoing ? " is going to " : " is Down To Go to "

  return `
  <div class="bg-white border rounded-lg shadow-sm">
    <div class="p-4">
      <div class="flex items-start space-x-3 mb-3">
        <button onclick="showPage('user', {username: '${post.username}'})" class="cursor-pointer hover:opacity-80">
          <img src="${post.profilePic}" alt="${post.username}" class="h-8 w-8 rounded-full">
        </button>
        <div class="flex-1">
          <p class="text-sm">
            <button onclick="showPage('user', {username: '${post.username}'})" class="font-medium hover:text-blue-600 transition-colors">
              ${post.username}
            </button>
            ${postText}
            <button onclick="showPage('event', {eventId: '${post.eventId}'})" class="font-medium text-blue-600 hover:underline">
              ${post.event}
            </button>
          </p>
          <div class="text-xs text-gray-500 mt-1">${post.timestamp}</div>
        </div>
      </div>
      <div class="flex items-center gap-6">
        <button onclick="showModal('going', '${post.event}', ${post.goingCount})" class="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors">
          <span>🎟️</span>
          <span class="font-medium">Going: ${post.goingCount}</span>
        </button>
        <button onclick="showModal('downToGo', '${post.event}', ${post.downToGoCount})" class="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors">
          <span>⬇️</span>
          <span class="font-medium">Down To Go: ${post.downToGoCount}</span>
        </button>
      </div>
    </div>
  </div>
`
}

// Event Search
function renderEventSearch() {
  return `
  <div class="mobile-container py-6">
    <h1 class="text-2xl font-bold mb-6">Event Search</h1>
    <div class="space-y-4 mb-6">
      <div class="relative">
        <i data-lucide="search" class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"></i>
        <input 
          type="search" 
          id="search-input"
          placeholder="Search by artist, team, venue, or city..." 
          class="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
      <div class="flex gap-2">
        <select id="genre-select" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Genres</option>
          <option value="pop">Pop</option>
          <option value="rock">Rock</option>
          <option value="country">Country</option>
          <option value="jazz">Jazz</option>
        </select>
      </div>
    </div>
    <div id="events-container" class="event-spacing">
      ${window.events.map((event) => renderEventCard(event)).join("")}
    </div>
  </div>
`
}

function renderEventCard(event) {
  const isGoing = userEventsStore.isEventGoing(event.id)
  const isDownToGo = userEventsStore.isEventDownToGo(event.id)

  return `
  <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
    <button onclick="showPage('event', {eventId: '${event.id}'})" class="w-full">
      <div class="relative h-40 w-full">
        <img src="${event.image}" alt="${event.name}" class="w-full h-full object-cover">
      </div>
    </button>
    <div class="p-4">
      <button onclick="showPage('event', {eventId: '${event.id}'})" class="text-left w-full">
        <h3 class="font-semibold text-lg mb-1 hover:text-blue-600 transition-colors">${event.name}</h3>
      </button>
      <div class="flex items-center text-sm text-gray-500 mb-1">
        <i data-lucide="calendar" class="h-4 w-4 mr-1"></i>
        <span>${event.date} • ${event.time}</span>
      </div>
      <div class="flex items-center text-sm text-gray-500 mb-3">
        <i data-lucide="map-pin" class="h-4 w-4 mr-1"></i>
        <span>${event.venue} • ${event.city}</span>
      </div>
      <div class="flex justify-between items-center mb-3">
        <div class="flex items-center gap-4">
          <span class="text-sm flex items-center gap-1">
            🎟️ <span class="font-medium">Going: ${event.goingCount}</span>
          </span>
          <span class="text-sm flex items-center gap-1">
            ⬇️ <span class="font-medium">Down To Go: ${event.downToGoCount}</span>
          </span>
        </div>
      </div>
      <div class="flex gap-2">
        <button 
          onclick="toggleEventGoing('${event.id}')" 
          class="flex-1 gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isGoing ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}"
        >
          ${isGoing ? "✓ Going" : "🎟️ Going"}
        </button>
        <button 
          onclick="toggleEventDownToGo('${event.id}')" 
          class="flex-1 gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isDownToGo ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}"
        >
          ${isDownToGo ? "✓ Down To Go" : "⬇️ Down To Go"}
        </button>
      </div>
    </div>
  </div>
`
}

function setupSearchFilters() {
  const searchInput = document.getElementById("search-input")
  const genreSelect = document.getElementById("genre-select")

  function filterEvents() {
    const searchQuery = searchInput.value.toLowerCase()
    const selectedGenre = genreSelect.value.toLowerCase()

    const filteredEvents = window.events.filter((event) => {
      const matchesSearch =
        !searchQuery ||
        event.name.toLowerCase().includes(searchQuery) ||
        event.venue.toLowerCase().includes(searchQuery) ||
        event.city.toLowerCase().includes(searchQuery)

      const matchesGenre = !selectedGenre || event.genre.toLowerCase() === selectedGenre

      return matchesSearch && matchesGenre
    })

    const container = document.getElementById("events-container")
    container.innerHTML =
      filteredEvents.length > 0
        ? filteredEvents.map((event) => renderEventCard(event)).join("")
        : '<p class="text-center py-8 text-gray-500">No events found matching your criteria.</p>'

    lucide.createIcons()
  }

  searchInput.addEventListener("input", filterEvents)
  genreSelect.addEventListener("change", filterEvents)
}

// Profile
function renderProfile() {
  const goingEvents = userEventsStore.getGoingEvents()
  const downToGoEvents = userEventsStore.getDownToGoEvents()

  const userGoingEvents = window.events.filter((event) => goingEvents.includes(event.id))
  const userDownToGoEvents = window.events.filter((event) => downToGoEvents.includes(event.id))

  return `
  <div class="mobile-container py-6">
    <div class="flex justify-between items-start mb-4">
      <div class="flex items-center gap-4">
        <div class="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-blue-200">
          <img src="https://via.placeholder.com/100x100/6c5ce7/white?text=AJ" alt="Alex Johnson" class="w-full h-full object-cover">
        </div>
        <div>
          <h1 class="text-2xl font-bold">Alex Johnson</h1>
          <p class="text-sm text-gray-500">@musicfan123</p>
          <div class="flex items-center text-sm text-gray-500 mt-1">
            <i data-lucide="map-pin" class="h-3 w-3 mr-1"></i>
            <span>Boston, MA</span>
          </div>
        </div>
      </div>
      <button class="p-2 text-gray-500 hover:text-gray-700">
        <i data-lucide="settings" class="h-4 w-4"></i>
      </button>
    </div>
    
    <div class="mb-4">
      <a href="https://forms.gle/7T31qYYytAb8ovfo6" target="_blank" class="block w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl text-center">
        💬 Give Feedback
      </a>
    </div>
    
    <p class="mb-6">Concert enthusiast | Sports fan | Always looking for the next great event</p>
    
    <div class="mb-6">
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button onclick="switchProfileTab('downToGo')" id="tab-downToGo" class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors bg-white shadow-sm">
          ⬇️ Down To Go (${userDownToGoEvents.length})
        </button>
        <button onclick="switchProfileTab('going')" id="tab-going" class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-gray-500">
          🎟️ Going (${userGoingEvents.length})
        </button>
      </div>
      
      <div id="profile-content" class="mt-4">
        <div class="event-spacing">
          ${
            userDownToGoEvents.length > 0
              ? userDownToGoEvents.map((event) => renderProfileEventCard(event)).join("")
              : '<p class="text-center py-8 text-gray-500">You haven\'t marked any events as "Down To Go" yet.</p>'
          }
        </div>
      </div>
    </div>
    
    <button class="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
      Edit Profile
    </button>
  </div>
`
}

function renderProfileEventCard(event) {
  return `
  <button onclick="showPage('event', {eventId: '${event.id}'})" class="w-full text-left">
    <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div class="relative h-32 w-full">
        <img src="${event.image}" alt="${event.name}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="font-semibold mb-1">${event.name}</h3>
        <div class="flex items-center text-sm text-gray-500">
          <i data-lucide="calendar" class="h-4 w-4 mr-1"></i>
          <span>${event.date}</span>
        </div>
        <div class="flex items-center text-sm text-gray-500 mt-1">
          <i data-lucide="map-pin" class="h-4 w-4 mr-1"></i>
          <span>${event.venue}</span>
        </div>
      </div>
    </div>
  </button>
`
}

function setupProfileTabs() {
  // Initial setup is done in renderProfile
}

function switchProfileTab(tab) {
  const goingEvents = userEventsStore.getGoingEvents()
  const downToGoEvents = userEventsStore.getDownToGoEvents()

  const userGoingEvents = window.events.filter((event) => goingEvents.includes(event.id))
  const userDownToGoEvents = window.events.filter((event) => downToGoEvents.includes(event.id))

  // Update tab buttons
  document.getElementById("tab-downToGo").className =
    tab === "downToGo"
      ? "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors bg-white shadow-sm"
      : "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-gray-500"

  document.getElementById("tab-going").className =
    tab === "going"
      ? "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors bg-white shadow-sm"
      : "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-gray-500"

  // Update content
  const content = document.getElementById("profile-content")
  const eventsToShow = tab === "going" ? userGoingEvents : userDownToGoEvents
  const emptyMessage =
    tab === "going"
      ? 'You haven\'t marked any events as "Going" yet.'
      : 'You haven\'t marked any events as "Down To Go" yet.'

  content.innerHTML = `
  <div class="event-spacing">
    ${
      eventsToShow.length > 0
        ? eventsToShow.map((event) => renderProfileEventCard(event)).join("")
        : `<p class="text-center py-8 text-gray-500">${emptyMessage}</p>`
    }
  </div>
`

  lucide.createIcons()
}

// Event Detail
function renderEventDetail(eventId) {
  const event = window.events.find((e) => e.id === eventId)
  if (!event) {
    return `
    <div class="mobile-container py-6 text-center">
      <p>Event not found</p>
      <button onclick="showPage('search')" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
        Back to Search
      </button>
    </div>
  `
  }

  const isGoing = userEventsStore.isEventGoing(event.id)
  const isDownToGo = userEventsStore.isEventDownToGo(event.id)

  return `
  <div class="mobile-container py-6">
    <div class="mb-6">
      <button onclick="showPage('search')" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <i data-lucide="arrow-left" class="h-4 w-4 mr-1"></i>
        Back to search
      </button>
      <div class="relative h-48 w-full rounded-lg overflow-hidden mb-4">
        <img src="${event.image}" alt="${event.name}" class="w-full h-full object-cover">
      </div>
      <h1 class="text-2xl font-bold mb-2">${event.name}</h1>
      <div class="flex items-center text-sm text-gray-500 mb-1">
        <i data-lucide="calendar" class="h-4 w-4 mr-1"></i>
        <span>${event.date} • ${event.time}</span>
      </div>
      <div class="flex items-center text-sm text-gray-500 mb-3">
        <i data-lucide="map-pin" class="h-4 w-4 mr-1"></i>
        <span>${event.venue} • ${event.city}</span>
      </div>
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <span class="text-sm flex items-center gap-1">
            🎟️ <span class="font-medium">Going: ${event.goingCount}</span>
          </span>
          <span class="text-sm flex items-center gap-1">
            ⬇️ <span class="font-medium">Down To Go: ${event.downToGoCount}</span>
          </span>
        </div>
        <div class="flex gap-2">
          <button 
            onclick="toggleEventGoing('${event.id}')" 
            class="gap-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${isGoing ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}"
          >
            ${isGoing ? "✓" : "🎟️"}
          </button>
          <button 
            onclick="toggleEventDownToGo('${event.id}')" 
            class="gap-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${isDownToGo ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}"
          >
            ${isDownToGo ? "✓" : "⬇️"}
          </button>
        </div>
      </div>
    </div>
    
    <div class="mb-6">
      <h2 class="text-lg font-semibold mb-3">Seating Chart</h2>
      <div class="seating-chart">
        <button onclick="showTicketModal('floor')" class="seat-button" style="top: 50%; left: 50%;">
          Floor
        </button>
        ${renderSeatButtons()}
      </div>
    </div>
  </div>
`
}

function renderSeatButtons() {
  let buttons = ""

  // 100s sections - inner circle
  window.seatingSections
    .filter((s) => s.id.startsWith("s1"))
    .forEach((section, index) => {
      const angle = index * 72 * (Math.PI / 180)
      const radius = 35
      const top = 50 + radius * Math.sin(angle)
      const left = 50 + radius * Math.cos(angle)

      buttons += `
    <button onclick="showTicketModal('${section.id}')" class="seat-button" style="top: ${top}%; left: ${left}%;">
      ${section.name.replace("Section ", "")}
    </button>
  `
    })

  // 200s sections - outer circle
  window.seatingSections
    .filter((s) => s.id.startsWith("s2"))
    .forEach((section, index) => {
      const angle = index * 72 * (Math.PI / 180)
      const radius = 45
      const top = 50 + radius * Math.sin(angle)
      const left = 50 + radius * Math.cos(angle)

      buttons += `
    <button onclick="showTicketModal('${section.id}')" class="seat-button" style="top: ${top}%; left: ${left}%;">
      ${section.name.replace("Section ", "")}
    </button>
  `
    })

  return buttons
}

function setupEventDetail() {
  // Event detail setup is handled in render function
}

// User Profile
function renderUserProfile(username) {
  const userProfile = window.userProfiles[username]
  if (!userProfile) {
    return `
    <div class="mobile-container py-6 text-center">
      <p>User not found</p>
      <button onclick="showPage('social-feed')" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
        Back to Feed
      </button>
    </div>
  `
  }

  return `
  <div class="mobile-container py-6">
    <div class="mb-6">
      <button onclick="showPage('social-feed')" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <i data-lucide="arrow-left" class="h-4 w-4 mr-1"></i>
        Back to feed
      </button>
      <div class="flex items-center gap-4 mb-4">
        <div class="relative h-20 w-20 rounded-full overflow-hidden">
          <img src="${userProfile.profilePic}" alt="${userProfile.displayName}" class="w-full h-full object-cover">
        </div>
        <div>
          <h1 class="text-2xl font-bold">${userProfile.displayName}</h1>
          <p class="text-sm text-gray-500">@${userProfile.username}</p>
          <div class="flex items-center text-sm text-gray-500 mt-1">
            <i data-lucide="map-pin" class="h-3 w-3 mr-1"></i>
            <span>${userProfile.location}</span>
          </div>
        </div>
      </div>
      <p class="mb-6">${userProfile.bio}</p>
    </div>
    
    <div class="mb-6">
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button onclick="switchUserTab('downToGo')" id="user-tab-downToGo" class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors bg-white shadow-sm">
          ⬇️ Down To Go
        </button>
        <button onclick="switchUserTab('going')" id="user-tab-going" class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-gray-500">
          🎟️ Going
        </button>
      </div>
      
      <div id="user-profile-content" class="mt-4">
        <div class="event-spacing">
          ${
            userProfile.eventsDownToGo && userProfile.eventsDownToGo.length > 0
              ? userProfile.eventsDownToGo.map((event) => renderProfileEventCard(event)).join("")
              : `<p class="text-center py-8 text-gray-500">${userProfile.username} hasn't marked any events as "Down To Go" yet.</p>`
          }
        </div>
      </div>
    </div>
  </div>
`
}

function setupUserProfileTabs() {
  // Initial setup is done in renderUserProfile
}

function switchUserTab(tab) {
  const userProfile = window.userProfiles[currentUsername]
  if (!userProfile) return

  // Update tab buttons
  document.getElementById("user-tab-downToGo").className =
    tab === "downToGo"
      ? "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors bg-white shadow-sm"
      : "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-gray-500"

  document.getElementById("user-tab-going").className =
    tab === "going"
      ? "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors bg-white shadow-sm"
      : "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-gray-500"

  // Update content
  const content = document.getElementById("user-profile-content")
  const eventsToShow = tab === "going" ? userProfile.eventsGoing : userProfile.eventsDownToGo
  const emptyMessage =
    tab === "going"
      ? `${userProfile.username} hasn't marked any events as "Going" yet.`
      : `${userProfile.username} hasn't marked any events as "Down To Go" yet.`

  content.innerHTML = `
  <div class="event-spacing">
    ${
      eventsToShow && eventsToShow.length > 0
        ? eventsToShow.map((event) => renderProfileEventCard(event)).join("")
        : `<p class="text-center py-8 text-gray-500">${emptyMessage}</p>`
    }
  </div>
`

  lucide.createIcons()
}

// Event Actions
function toggleEventGoing(eventId) {
  const isCurrentlyGoing = userEventsStore.isEventGoing(eventId)
  userEventsStore.setEventGoing(eventId, !isCurrentlyGoing)

  // Refresh current page to update UI
  if (currentPage === "search") {
    setupSearchFilters()
    document.getElementById("search-input").dispatchEvent(new Event("input"))
  } else if (currentPage === "event") {
    showPage("event", { eventId: currentEventId })
  } else if (currentPage === "profile") {
    showPage("profile")
  }
}

function toggleEventDownToGo(eventId) {
  const isCurrentlyDownToGo = userEventsStore.isEventDownToGo(eventId)
  userEventsStore.setEventDownToGo(eventId, !isCurrentlyDownToGo)

  // Refresh current page to update UI
  if (currentPage === "search") {
    setupSearchFilters()
    document.getElementById("search-input").dispatchEvent(new Event("input"))
  } else if (currentPage === "event") {
    showPage("event", { eventId: currentEventId })
  } else if (currentPage === "profile") {
    showPage("profile")
  }
}

// Modal Functions
function showModal(type, eventName, count) {
  const users = type === "going" ? window.sampleUsers.going : window.sampleUsers.downToGo
  const displayUsers = users.slice(0, Math.min(count, 10))

  const modalHtml = `
  <div class="modal-overlay" onclick="closeModal()">
    <div class="modal-content p-6 w-80" onclick="event.stopPropagation()">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">${type === "going" ? "Going" : "Down To Go"} to ${eventName}</h3>
        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
          <i data-lucide="x" class="h-5 w-5"></i>
        </button>
      </div>
      <div class="space-y-2 max-h-60 overflow-y-auto">
        ${displayUsers
          .map(
            (user) => `
          <button onclick="showPage('user', {username: '${user.username}'}); closeModal();" class="flex items-center gap-2 hover:bg-gray-100 p-2 rounded w-full text-left">
            <img src="${user.profilePic}" alt="${user.username}" class="h-6 w-6 rounded-full">
            <span class="text-sm">${user.username}</span>
          </button>
        `,
          )
          .join("")}
        ${count > 10 ? `<div class="text-xs text-gray-500 text-center">+${count - 10} more</div>` : ""}
      </div>
    </div>
  </div>
`

  document.getElementById("modal-container").innerHTML = modalHtml
  lucide.createIcons()
}

function showTicketModal(sectionId) {
  const section = window.seatingSections.find((s) => s.id === sectionId)
  const prices = window.ticketPrices[sectionId]

  if (!section || !prices) return

  const modalHtml = `
  <div class="modal-overlay" onclick="closeModal()">
    <div class="modal-content p-6 w-80" onclick="event.stopPropagation()">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">${section.name} Tickets</h3>
        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
          <i data-lucide="x" class="h-5 w-5"></i>
        </button>
      </div>
      <div class="space-y-3 max-h-80 overflow-y-auto">
        ${window.ticketProviders
          .map((provider) => {
            const price = prices[provider.id]
            if (!price) return ""

            return `
            <div class="border rounded-lg p-3">
              <div class="text-xs text-gray-500 mb-2">via ${provider.name}</div>
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-medium">$${price.total.toFixed(2)}</div>
                  <div class="text-xs text-gray-500">
                    $${price.price.toFixed(2)} + $${price.fees.toFixed(2)} fees
                  </div>
                </div>
                <a href="${price.url}" target="_blank" class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                  Buy Now
                </a>
              </div>
            </div>
          `
          })
          .join("")}
      </div>
    </div>
  </div>
`

  document.getElementById("modal-container").innerHTML = modalHtml
  lucide.createIcons()
}

function closeModal() {
  document.getElementById("modal-container").innerHTML = ""
}

// Subscribe to user events store changes
userEventsStore.subscribe(() => {
  // Update UI when user events change
  if (currentPage === "profile") {
    // Update profile tab counts
    const goingCount = userEventsStore.getGoingEvents().length
    const downToGoCount = userEventsStore.getDownToGoEvents().length

    const downToGoTab = document.getElementById("tab-downToGo")
    const goingTab = document.getElementById("tab-going")

    if (downToGoTab) {
      downToGoTab.innerHTML = `⬇️ Down To Go (${downToGoCount})`
    }
    if (goingTab) {
      goingTab.innerHTML = `🎟️ Going (${goingCount})`
    }
  }
})
