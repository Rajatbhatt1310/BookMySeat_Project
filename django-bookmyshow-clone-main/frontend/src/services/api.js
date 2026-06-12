import {
  fallbackMovies,
  fallbackTheaters,
  generateFallbackSeats,
} from "../data/dummyData.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(endpoint, options = {}, fallbackValue = null) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    // Django redirected to login page
    if (response.redirected) {
      throw new Error(`Redirected to login: ${response.url}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Django returned HTML instead of JSON
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Expected JSON but received ${contentType}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);

    // Only use fallback for GET requests
    if (
      (!options.method || options.method === "GET") &&
      fallbackValue !== null
    ) {
      console.info("Using fallback data");
      return fallbackValue;
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getMovies() {
  const data = await request(
    "/movies/",
    {},
    { results: fallbackMovies }
  );

  return Array.isArray(data)
    ? data
    : data?.results || [];
}

export async function getMovieCatalog(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, item);
        }
      });
    } else if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();

  return request(
    `/movies/${query ? `?${query}` : ""}`,
    {},
    {
      results: fallbackMovies,
      pagination: {
        page: 1,
        page_size: 12,
        total_pages: 1,
        total_results: fallbackMovies.length,
        has_next: false,
        has_previous: false,
      },
      filters: {
        genres: [],
        languages: [],
      },
      sorting: {
        current: "name",
        allowed: [
          "name",
          "-name",
          "rating",
          "-rating",
          "newest",
          "oldest",
        ],
      },
    }
  );
}

export async function getMovie(movieId) {
  const fallbackMovie =
    fallbackMovies.find(
      (movie) => String(movie.id) === String(movieId)
    ) || fallbackMovies[0];

  return request(
    `/movies/${movieId}/`,
    {},
    fallbackMovie
  );
}

export async function getTheaters(movieId) {
  const fallback = fallbackTheaters.filter(
    (theater) => String(theater.movie) === String(movieId)
  );

  return request(
    `/theaters/?movie=${movieId}`,
    {},
    fallback
  );
}

export async function getTheater(theaterId) {
  const fallbackTheater =
    fallbackTheaters.find(
      (theater) => String(theater.id) === String(theaterId)
    ) || fallbackTheaters[0];

  return request(
    `/theaters/${theaterId}/`,
    {},
    fallbackTheater
  );
}

export async function getSeats(theaterId) {
  return request(
    `/seats/?theater=${theaterId}`,
    {},
    generateFallbackSeats(theaterId)
  );
}

export async function createBooking(payload) {
  return request(
    "/bookings/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function lockSeats(payload) {
  return request(
    "/lock-seats/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function confirmLockedBooking(payload) {
  return request(
    "/confirm-booking/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createPaymentOrder(payload) {
  return request(
    "/create-payment-order/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function verifyPayment(payload) {
  return request(
    "/verify-payment/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function getAdminAnalytics() {
  const response = await fetch(
    `${API_BASE_URL}/admin/analytics/`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Unauthorized admin access");
  }

  return response.json();
}