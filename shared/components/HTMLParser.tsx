import parse from 'html-react-parser'

interface I_Props {
  htmlContent: string
}
const HTMLParser = ({ htmlContent }: I_Props) => {
  return <div className="htmlParsedContent" style={{ whiteSpace: 'pre' }}>{parse(htmlContent)}</div>
}

export default HTMLParser
