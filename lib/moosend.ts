/**
 * Moosend email marketing integration
 */

async function addToMoosendList(email: string, name: string | null | undefined, listId: string) {
  const apiKey = process.env.MOOSEND_API_KEY
  
  if (!apiKey || !listId) {
    return
  }

  try {
    const response = await fetch(
      `https://api.moosend.com/v3/subscribers/${listId}/subscribe.json?apikey=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Name: name || "",
        }),
      }
    )

    if (response.ok) {
      console.log("[Moosend] Successfully added subscriber:", email)
    } else {
      const errorData = await response.text()
      console.error("[Moosend] Error adding subscriber:", errorData)
    }
  } catch (error) {
    console.error("[Moosend] Failed to add subscriber:", error)
  }
}

export async function addTenantToMoosend(email: string, name?: string | null) {
  const listId = process.env.MOOSEND_TENANT_LIST_ID
  if (listId) {
    await addToMoosendList(email, name, listId)
  }
}

export async function addContactToMoosend(email: string, name?: string | null) {
  const listId = process.env.MOOSEND_ALL_LIST_ID
  if (listId) {
    await addToMoosendList(email, name, listId)
  }
}
