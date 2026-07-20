import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LiteYouTube } from './lite-youtube'

const props = { youtubeId: 'ozUMkwIDjuc', title: 'A free skill that makes answers shorter' }

describe('LiteYouTube', () => {
  it('renders the YouTube thumbnail', () => {
    const { container } = render(<LiteYouTube {...props} />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', expect.stringContaining('ozUMkwIDjuc'))
  })

  // the thumbnail is decorative: the button already carries the accessible
  // name, so a non-empty alt would announce the same video twice
  it('marks the thumbnail decorative so it is not double-announced', () => {
    const { container } = render(<LiteYouTube {...props} />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
    expect(screen.queryByRole('img')).toBeNull()
  })

  // the entire reason this component exists: six eager iframes would wreck CWV
  it('renders NO iframe before the user asks for it', () => {
    const { container } = render(<LiteYouTube {...props} />)
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('exposes an accessible play control naming the video', () => {
    render(<LiteYouTube {...props} />)
    expect(screen.getByRole('button', { name: /play/i })).toHaveAccessibleName(
      expect.stringContaining(props.title) as unknown as string,
    )
  })

  it('swaps in the embed iframe once played', async () => {
    const user = userEvent.setup()
    const { container } = render(<LiteYouTube {...props} />)
    await user.click(screen.getByRole('button', { name: /play/i }))
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe).toHaveAttribute('src', expect.stringContaining('/embed/ozUMkwIDjuc'))
  })

  it('uses the no-cookie embed host and autoplays on click', async () => {
    const user = userEvent.setup()
    const { container } = render(<LiteYouTube {...props} />)
    await user.click(screen.getByRole('button', { name: /play/i }))
    const src = container.querySelector('iframe')?.getAttribute('src') ?? ''
    expect(src).toContain('youtube-nocookie.com')
    expect(src).toContain('autoplay=1')
  })

  it('gives the iframe an accessible title', async () => {
    const user = userEvent.setup()
    render(<LiteYouTube {...props} />)
    await user.click(screen.getByRole('button', { name: /play/i }))
    expect(screen.getByTitle(props.title)).toBeInTheDocument()
  })
})
