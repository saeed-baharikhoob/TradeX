import React from 'react'
import { render, screen } from '@testing-library/react'
import { PnlDisplay } from '../PnlDisplay'

describe('PnlDisplay', () => {
  it('should render positive PnL in green', () => {
    const { container } = render(<PnlDisplay pnl={100} pnlPercent={10} />)

    expect(screen.getByText(/\+100/)).toBeInTheDocument()
    expect(screen.getByText(/\+10\.00%/)).toBeInTheDocument()

    const element = container.querySelector('.text-trading-green')
    expect(element).toBeInTheDocument()
  })

  it('should render negative PnL in red', () => {
    const { container } = render(<PnlDisplay pnl={-100} pnlPercent={-10} />)

    expect(screen.getByText(/-100/)).toBeInTheDocument()
    expect(screen.getByText(/-10\.00%/)).toBeInTheDocument()

    const element = container.querySelector('.text-trading-red')
    expect(element).toBeInTheDocument()
  })

  it('should render zero PnL in green (as it is >= 0)', () => {
    const { container } = render(<PnlDisplay pnl={0} pnlPercent={0} />)


    const elements = screen.getAllByText(/\+0/)
    expect(elements.length).toBeGreaterThan(0)


    const element = container.querySelector('.text-trading-green')
    expect(element).toBeInTheDocument()
  })

  it('should format large PnL values', () => {
    render(<PnlDisplay pnl={12345.67} pnlPercent={123.45} />)

    expect(screen.getByText(/12,345\.67/)).toBeInTheDocument()
    expect(screen.getByText(/123\.45%/)).toBeInTheDocument()
  })

  it('should format small PnL values', () => {
    render(<PnlDisplay pnl={0.12} pnlPercent={0.01} />)

    expect(screen.getByText(/0\.12/)).toBeInTheDocument()
    expect(screen.getByText(/0\.01%/)).toBeInTheDocument()
  })
})
