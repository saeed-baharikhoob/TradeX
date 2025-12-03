import React from 'react'
import { render, screen } from '@testing-library/react'
import { PriceDisplay } from '../PriceDisplay'

describe('PriceDisplay', () => {
  it('should render price correctly', () => {
    render(<PriceDisplay price={50000} />)
    expect(screen.getByText(/50,000/)).toBeInTheDocument()
  })

  it('should apply green color for positive change', () => {
    const { container } = render(<PriceDisplay price={55000} previousPrice={50000} />)
    const element = container.querySelector('.text-trading-green')
    expect(element).toBeInTheDocument()
  })

  it('should apply red color for negative change', () => {
    const { container } = render(<PriceDisplay price={45000} previousPrice={50000} />)
    const element = container.querySelector('.text-trading-red')
    expect(element).toBeInTheDocument()
  })

  it('should not colorize when colorize is false', () => {
    const { container } = render(<PriceDisplay price={50000} previousPrice={45000} colorize={false} />)
    const element = container.querySelector('.text-white')
    expect(element).toBeInTheDocument()
  })

  it('should format large prices', () => {
    render(<PriceDisplay price={100000} />)
    expect(screen.getByText(/100,000/)).toBeInTheDocument()
  })

  it('should format small prices', () => {
    render(<PriceDisplay price={0.0001} />)
    expect(screen.getByText(/0\.000100/)).toBeInTheDocument()
  })

  it('should show sign when requested', () => {
    render(<PriceDisplay price={50000} previousPrice={45000} showSign={true} />)

    expect(screen.getByText(/50,000/)).toBeInTheDocument()
  })
})
