export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function shareFile(blob: Blob, filename: string, title: string): Promise<boolean> {
  if (!navigator.share) {
    return false
  }

  const file = new File([blob], filename, { type: blob.type })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, files: [file] })
    return true
  }

  return false
}

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}
