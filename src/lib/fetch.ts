export interface FetchResult<T> {
  ok: boolean;
  status: number;
  statusText: string;
  data?: T;
  error?: string;
}

export const fetchWithResult = async <T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<FetchResult<T>> => {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      return {
        status: response.status,
        statusText: response.statusText,
        ok: false,
        error: await response.text(),
      };
    }

    const data = (await response.json()) as T;
    return {
      status: response.status,
      statusText: response.statusText,
      ok: true,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      statusText: "",
      ok: false,
      error: (error as Error).message,
    };
  }
};
